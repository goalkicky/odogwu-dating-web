import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import theme from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
}

export default function Input({ label, error, prefix, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {prefix && <View style={styles.prefix}>{prefix}</View>}
        <TextInput
          placeholderTextColor={theme.colors.textTertiary}
          style={[styles.input, prefix ? styles.inputWithPrefix : null, style]}
          {...props}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    paddingVertical: 14,
  },
  inputWithPrefix: {
    paddingLeft: 8,
  },
  prefix: {
    marginRight: 8,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  error: {
    color: theme.colors.error,
    fontSize: 12,
    marginLeft: 4,
  },
});
