import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../theme';
import { useNav } from '../navigation';

export function Screen({ title, children, showBack = true }: { title: string; children: React.ReactNode; showBack?: boolean }) {
  const { back, stack } = useNav();
  return (
    <View style={s.screen}>
      <View style={s.header}>
        {showBack && stack.length > 1 ? (
          <Pressable onPress={back}><Text style={s.back}>‹ Back</Text></Pressable>
        ) : null}
        <Text style={s.brand}>PLURR</Text>
      </View>
      <Text style={s.title}>{title}</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>{children}</ScrollView>
    </View>
  );
}

export function Button({ label, onPress, kind = 'primary', disabled }: { label: string; onPress: () => void; kind?: 'primary' | 'ghost' | 'danger'; disabled?: boolean }) {
  const bg = kind === 'primary' ? colors.primary : kind === 'danger' ? colors.bad : 'transparent';
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[s.btn, { backgroundColor: bg, opacity: disabled ? 0.4 : 1, borderWidth: kind === 'ghost' ? 1 : 0, borderColor: colors.muted }]}>
      <Text style={s.btnText}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={s.card}>{children}</View>;
}

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.muted} style={s.input} {...props} />;
}

export const T = {
  body: (p: { children: React.ReactNode }) => <Text style={s.body}>{p.children}</Text>,
  muted: (p: { children: React.ReactNode }) => <Text style={s.muted}>{p.children}</Text>,
  strong: (p: { children: React.ReactNode }) => <Text style={s.strong}>{p.children}</Text>,
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { color: colors.accent, fontSize: 16 },
  brand: { color: colors.primary, fontWeight: '900', letterSpacing: 4, fontSize: 18 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginVertical: 14 },
  btn: { padding: 14, borderRadius: 12, alignItems: 'center', marginVertical: 6 },
  btnText: { color: colors.text, fontWeight: '700', fontSize: 16 },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 14, marginVertical: 6 },
  input: { backgroundColor: colors.card, color: colors.text, borderRadius: 10, padding: 12, marginVertical: 6 },
  body: { color: colors.text, fontSize: 15, marginVertical: 2 },
  muted: { color: colors.muted, fontSize: 13, marginVertical: 2 },
  strong: { color: colors.accent, fontSize: 16, fontWeight: '700' },
});
