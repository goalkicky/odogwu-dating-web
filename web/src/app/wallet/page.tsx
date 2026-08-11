'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CoinsIcon, DiamondIcon } from '@/components/Icons';
import Button from '@/components/Button';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';
import DesktopLayout from '@/components/DesktopLayout';
import { walletService } from '@/lib/cloudflare/services';

const PACKS = [
  { coins: 10, naira: 1000 },
  { coins: 25, naira: 2500 },
  { coins: 50, naira: 5000 },
  { coins: 100, naira: 10000 },
  { coins: 200, naira: 20000 },
];

const TX_LABELS: Record<string, string> = {
  purchase: 'Coins purchased',
  gift_in: 'Gift received',
  gift_out: 'Gift sent',
  premium_paid: 'Premium subscription',
};

function formatNaira(amount: number) {
  return 'N' + amount.toLocaleString('en-NG');
}

export default function WalletPage() {
  return (
    <Suspense fallback={null}>
      <WalletContent />
    </Suspense>
  );
}

function WalletContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [coins, setCoins] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [notice, setNotice] = useState('');

  const refresh = async () => {
    try {
      const data = await walletService.getWallet();
      setCoins(data?.coins ?? 0);
      setTransactions(data?.transactions || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const ref = searchParams.get('reference');
    const status = searchParams.get('status');
    if (ref && status === 'success') {
      setVerifying(true);
      walletService.verifyPurchase(ref)
        .then(async () => {
          await refresh();
          setNotice('Coins added to your wallet.');
          router.replace('/wallet');
        })
        .catch((e: any) => {
          setNotice(e?.message || 'Payment could not be verified. Contact support if you were charged.');
        })
        .finally(() => setVerifying(false));
    } else if (status === 'cancelled') {
      setNotice('Payment was cancelled.');
      router.replace('/wallet');
    }
  }, [searchParams, router]);

  const handleBuy = async (pack: { coins: number; naira: number }) => {
    setInitializing(String(pack.coins));
    try {
      const data = await walletService.purchase(pack.coins);
      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }
      setNotice('Could not start payment. Please try again.');
    } catch (e: any) {
      setNotice(e?.message || 'Could not start payment.');
    }
    setInitializing(null);
  };

  const totalSpent = transactions
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + (t.meta?.amountKobo || 0) / 100, 0);

  return (
    <DesktopLayout>
      <GradientBackground style={{ minHeight: '100vh', padding: '24px 16px 110px' }}>
      <div>
        <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="grad-ring" style={{ display: 'flex' }}>
              <CoinsIcon size={22} color="white" />
            </div>
            <div>
              <span style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>Wallet</span>
              <div style={{ fontSize: 12, color: '#FFD700', fontWeight: 700, marginTop: 1 }}>1 coin = N100</div>
            </div>
          </div>
          <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 14 }}>
            <CoinsIcon size={18} color="#FFD700" />
            <span style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{coins}</span>
            <span style={{ fontSize: 12, color: '#6B6B6B', fontWeight: 600 }}>coins</span>
          </div>
        </div>

        {verifying && (
          <div className="glass animate-fade-up" style={{ marginBottom: 18, padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', border: '3px solid rgba(255,215,0,0.2)', borderTopColor: '#FFD700', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ color: '#ABABAB', fontSize: 14 }}>Verifying your payment…</span>
          </div>
        )}

        {notice && (
          <div className="glass animate-fade-up" style={{ marginBottom: 18, padding: 14, borderRadius: 14, background: 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,55,95,0.08))', border: '1px solid rgba(255,215,0,0.25)' }}>
            <span style={{ color: '#E8E8E8', fontSize: 13.5 }}>{notice}</span>
          </div>
        )}

        <div className="animate-fade-up" style={{ marginBottom: 26 }}>
          <div className="glass" style={{ padding: 24, borderRadius: 24, background: 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,55,95,0.06)), rgba(255,255,255,0.03)', border: '1px solid rgba(255,215,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #FFD700, #FF9500)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 26px rgba(255,215,0,0.35)' }}>
                <CoinsIcon size={26} color="#1A1A1A" />
              </div>
              <div>
                <span style={{ fontSize: 13, color: '#FFD700', fontWeight: 700, letterSpacing: 1 }}>COIN BALANCE</span>
                <div style={{ fontSize: 34, fontWeight: 800, color: 'white', marginTop: 2 }}>
                  {coins} <span style={{ fontSize: 16, color: '#ABABAB', fontWeight: 600 }}>coins</span>
                </div>
                <div style={{ fontSize: 12.5, color: '#ABABAB', marginTop: 2 }}>
                  ≈ {formatNaira(coins * 100)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
              <Button title="Buy Coins" variant="gradient" size="md" onPress={() => document.getElementById('packs')?.scrollIntoView({ behavior: 'smooth' })} />
              <Button title="Go Premium" variant="outline" size="md" onPress={() => router.push('/premium')} />
            </div>
          </div>
        </div>

        <div id="packs" className="animate-fade-up" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0 }}>Buy coins</h2>
            <span style={{ fontSize: 12.5, color: '#6B6B6B' }}>Secure checkout via Paystack</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {PACKS.map((pack, i) => (
              <div
                key={pack.coins}
                className="glass lift"
                style={{ padding: 18, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 0.05}s` }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg, #FFD700, #FF9500)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 18px rgba(255,215,0,0.3)' }}>
                  <CoinsIcon size={22} color="#1A1A1A" />
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>{pack.coins}</div>
                <div style={{ fontSize: 12.5, color: '#6B6B6B' }}>{formatNaira(pack.naira)}</div>
                <Button
                  title={initializing === String(pack.coins) ? 'Starting…' : 'Buy'}
                  variant="gradient"
                  size="sm"
                  loading={initializing === String(pack.coins)}
                  disabled={!!initializing}
                  onPress={() => handleBuy(pack)}
                  style={{ width: '100%', marginTop: 2 }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="animate-fade-up">
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: '0 0 14px' }}>History</h2>
          {loading ? (
            <div className="glass" style={{ padding: 30, borderRadius: 18, textAlign: 'center' }}>
              <span style={{ color: '#6B6B6B', fontSize: 14 }}>Loading…</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="glass" style={{ padding: 34, borderRadius: 18, textAlign: 'center' }}>
              <CoinsIcon size={34} color="#3A3A3A" />
              <div style={{ color: '#6B6B6B', fontSize: 14, marginTop: 10 }}>No transactions yet. Buy coins to get started.</div>
            </div>
          ) : (
            <div className="glass" style={{ borderRadius: 18, overflow: 'hidden' }}>
              {transactions.map((t, i) => {
                const isCredit = t.type === 'purchase' || t.type === 'gift_in';
                const label = TX_LABELS[t.type] || t.type;
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: i < transactions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: isCredit ? 'rgba(52,199,89,0.12)' : 'rgba(255,55,95,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CoinsIcon size={18} color={isCredit ? '#34C759' : '#FF6B8A'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'white' }}>{label}</div>
                      <div style={{ fontSize: 11.5, color: '#6B6B6B', marginTop: 1 }}>{new Date(t.createdAt).toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: isCredit ? '#34C759' : '#FF6B8A' }}>
                        {isCredit ? '+' : '-'}{t.amount}
                      </div>
                      <div style={{ fontSize: 11, color: '#6B6B6B' }}>balance {t.balanceAfter}</div>
                    </div>
                  </div>
                );
              })}
              {totalSpent > 0 && (
                <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)' }}>
                  <span style={{ fontSize: 12, color: '#6B6B6B' }}>
                    Total spent: {formatNaira(totalSpent)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: '26px 10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <DiamondIcon size={15} color="#6B6B6B" />
          <span style={{ fontSize: 12, color: '#6B6B6B' }}>
            Use coins to gift your matches or subscribe to Premium.
          </span>
        </div>

        <TabBar />
      </div>
      </GradientBackground>
    </DesktopLayout>
  );
}
