'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CoinsIcon, DiamondIcon } from '@/components/Icons';
import Button from '@/components/Button';
import AppShell from '@/components/AppShell';
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
    <AppShell>
      <div>
        <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="grad-ring" style={{ display: 'flex' }}>
              <CoinsIcon size={22} color="#d20a19" />
            </div>
            <div>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#151515' }}>Wallet</span>
              <div style={{ fontSize: 12, color: '#FFE600', fontWeight: 700, marginTop: 1 }}>1 coin = N100</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 14, background: '#fff', border: '1px solid #EDEDF1', boxShadow: '0 1px 4px rgba(20,20,25,0.03)' }}>
            <CoinsIcon size={18} color="#FFE600" />
            <span style={{ fontSize: 18, fontWeight: 800, color: '#151515' }}>{coins}</span>
            <span style={{ fontSize: 12, color: '#8A8A8F', fontWeight: 600 }}>coins</span>
          </div>
        </div>

        {verifying && (
          <div className="animate-fade-up" style={{ marginBottom: 18, padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #EDEDF1', boxShadow: '0 1px 4px rgba(20,20,25,0.03)' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', border: '3px solid rgba(255,230,0,0.2)', borderTopColor: '#FFE600', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ color: '#8A8A8F', fontSize: 14 }}>Verifying your paymentÃ¢â‚¬Â¦</span>
          </div>
        )}

        {notice && (
          <div className="animate-fade-up" style={{ marginBottom: 18, padding: 14, borderRadius: 14, background: 'linear-gradient(135deg, rgba(255,230,0,0.12), rgba(255,46,95,0.08))', border: '1px solid rgba(255,230,0,0.25)' }}>
            <span style={{ color: '#151515', fontSize: 13.5 }}>{notice}</span>
          </div>
        )}

        <div className="animate-fade-up" style={{ marginBottom: 26 }}>
          <div style={{ padding: 24, borderRadius: 24, background: 'linear-gradient(135deg, rgba(255,230,0,0.12), rgba(255,46,95,0.06)), #fff', border: '1px solid rgba(255,230,0,0.2)', boxShadow: '0 1px 4px rgba(20,20,25,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #FFE600, #FFB62B)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 26px rgba(255,230,0,0.35)' }}>
                <CoinsIcon size={26} color="#1A1A1A" />
              </div>
              <div>
                <span style={{ fontSize: 13, color: '#FFE600', fontWeight: 700, letterSpacing: 1 }}>COIN BALANCE</span>
                <div style={{ fontSize: 34, fontWeight: 800, color: '#151515', marginTop: 2 }}>
                  {coins} <span style={{ fontSize: 16, color: '#8A8A8F', fontWeight: 600 }}>coins</span>
                </div>
                <div style={{ fontSize: 12.5, color: '#8A8A8F', marginTop: 2 }}>
                  Ã¢â€°Ë† {formatNaira(coins * 100)}
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
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#151515', margin: 0 }}>Buy coins</h2>
            <span style={{ fontSize: 12.5, color: '#8A8A8F' }}>Secure checkout via Paystack</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {PACKS.map((pack, i) => (
              <div
                key={pack.coins}
                className="lift"
                style={{ padding: 18, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 0.05}s`, background: '#fff', border: '1px solid #EDEDF1', boxShadow: '0 1px 4px rgba(20,20,25,0.03)' }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg, #FFE600, #FFB62B)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 18px rgba(255,230,0,0.3)' }}>
                  <CoinsIcon size={22} color="#1A1A1A" />
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#151515' }}>{pack.coins}</div>
                <div style={{ fontSize: 12.5, color: '#8A8A8F' }}>{formatNaira(pack.naira)}</div>
                <Button
                  title={initializing === String(pack.coins) ? 'StartingÃ¢â‚¬Â¦' : 'Buy'}
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
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#151515', margin: '0 0 14px' }}>History</h2>
          {loading ? (
            <div style={{ padding: 30, borderRadius: 18, textAlign: 'center', background: '#fff', border: '1px solid #EDEDF1', boxShadow: '0 1px 4px rgba(20,20,25,0.03)' }}>
              <span style={{ color: '#8A8A8F', fontSize: 14 }}>LoadingÃ¢â‚¬Â¦</span>
            </div>
          ) : transactions.length === 0 ? (
            <div style={{ padding: 34, borderRadius: 18, textAlign: 'center', background: '#fff', border: '1px solid #EDEDF1', boxShadow: '0 1px 4px rgba(20,20,25,0.03)' }}>
              <CoinsIcon size={34} color="#C0C0C5" />
              <div style={{ color: '#8A8A8F', fontSize: 14, marginTop: 10 }}>No transactions yet. Buy coins to get started.</div>
            </div>
          ) : (
            <div style={{ borderRadius: 18, overflow: 'hidden', background: '#fff', border: '1px solid #EDEDF1', boxShadow: '0 1px 4px rgba(20,20,25,0.03)' }}>
              {transactions.map((t, i) => {
                const isCredit = t.type === 'purchase' || t.type === 'gift_in';
                const label = TX_LABELS[t.type] || t.type;
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: i < transactions.length - 1 ? '1px solid #F0F0F3' : 'none' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: isCredit ? 'rgba(61,252,119,0.12)' : 'rgba(255,46,95,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CoinsIcon size={18} color={isCredit ? '#3DFC77' : '#FF7BA0'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#151515' }}>{label}</div>
                      <div style={{ fontSize: 11.5, color: '#8A8A8F', marginTop: 1 }}>{new Date(t.createdAt).toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: isCredit ? '#3DFC77' : '#FF7BA0' }}>
                        {isCredit ? '+' : '-'}{t.amount}
                      </div>
                      <div style={{ fontSize: 11, color: '#8A8A8F' }}>balance {t.balanceAfter}</div>
                    </div>
                  </div>
                );
              })}
              {totalSpent > 0 && (
                <div style={{ padding: '12px 16px', background: '#FAFAFA' }}>
                  <span style={{ fontSize: 12, color: '#8A8A8F' }}>
                    Total spent: {formatNaira(totalSpent)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: '26px 10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <DiamondIcon size={15} color="#8A8A8F" />
          <span style={{ fontSize: 12, color: '#8A8A8F' }}>
            Use coins to gift your matches or subscribe to Premium.
          </span>
        </div>
      </div>
    </AppShell>
  );
}
