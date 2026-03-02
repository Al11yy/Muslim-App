import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemePreference } from '@/contexts/theme-preference';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

const QUICK_PROMPTS = [
  'Doa saat gelisah',
  'Amalan pagi',
  'Adab menuntut ilmu',
  'Motivasi istiqomah',
];

function getAiReply(input: string) {
  const q = input.toLowerCase();
  if (q.includes('doa')) {
    return 'Untuk doa harian, coba mulai dari yang sederhana tapi rutin. Kamu bisa cek menu Doa Harian untuk bacaan lengkapnya.';
  }
  if (q.includes('shalat') || q.includes('sholat')) {
    return 'Untuk memperbaiki shalat, fokus ke ketepatan waktu, bacaan yang benar, dan kekhusyukan secara bertahap.';
  }
  if (q.includes('sedih') || q.includes('gelisah')) {
    return 'Saat hati berat, coba dzikir pendek yang konsisten, tarik napas pelan, lalu baca doa perlindungan dan ketenangan.';
  }
  return 'InsyaAllah, aku siap bantu. Tulis pertanyaanmu lebih spesifik ya, supaya jawabannya lebih tepat dan bermanfaat.';
}

export default function AiMuslim() {
  const { resolvedTheme } = useThemePreference();
  const isDark = resolvedTheme === 'dark';
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Assalamu\'alaikum. Saya siap bantu pertanyaan seputar ibadah, doa, dan motivasi Islami.',
    },
  ]);

  const canSend = useMemo(() => input.trim().length > 0, [input]);
  const theme = useMemo(
    () => ({
      bg: isDark ? '#1A130B' : '#F7F1E8',
      text: isDark ? '#F6ECDD' : '#1C1408',
      muted: isDark ? '#CAB79C' : '#8A7255',
      surface: isDark ? '#2A1F12' : '#FFFDF5',
      surfaceSoft: isDark ? '#332516' : '#FFF9ED',
      border: isDark ? '#4A3825' : '#E9D8BD',
      input: isDark ? '#EEDFC8' : '#3D2108',
      gold: '#C68B2F',
    }),
    [isDark]
  );

  const sendMessage = (rawText?: string) => {
    const text = (rawText ?? input).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `${Date.now()}-u`,
      role: 'user',
      text,
    };

    const aiMsg: Message = {
      id: `${Date.now()}-a`,
      role: 'assistant',
      text: getAiReply(text),
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={[styles.title, { color: theme.text }]}>AI Muslim</Text>
        <View style={[styles.botBadge, { borderColor: theme.border, backgroundColor: theme.surfaceSoft }]}>
          <MaterialCommunityIcons name="robot-outline" size={14} color={theme.gold} />
          <Text style={styles.botBadgeText}>Beta</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isUser = item.role === 'user';
          return (
            <View style={[styles.bubbleRow, isUser ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
              <View
                style={[
                  styles.bubble,
                  isUser ? styles.userBubble : styles.aiBubble,
                  !isUser && { backgroundColor: theme.surface, borderColor: theme.border },
                ]}>
                <Text style={[styles.bubbleText, !isUser && { color: theme.input }, isUser && styles.userBubbleText]}>
                  {item.text}
                </Text>
              </View>
            </View>
          );
        }}
        ListHeaderComponent={
          <View style={styles.promptsWrap}>
            <Text style={[styles.sectionLabel, { color: theme.muted }]}>Pertanyaan Cepat</Text>
            <View style={styles.promptRow}>
              {QUICK_PROMPTS.map((prompt) => (
                <Pressable
                  key={prompt}
                  style={[styles.promptChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => sendMessage(prompt)}>
                  <Text style={[styles.promptText, { color: theme.muted }]}>{prompt}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
      />

      <View style={[styles.inputWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Tulis pertanyaanmu..."
          placeholderTextColor={theme.muted}
          style={[styles.input, { color: theme.input }]}
          multiline
        />
        <Pressable
          style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          disabled={!canSend}>
          <Ionicons name="send" size={16} color="#FFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F1E8',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1408',
    fontFamily: 'serif',
  },
  botBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E9D8BD',
    backgroundColor: '#FFF9ED',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  botBadgeText: {
    color: '#AF7A36',
    fontSize: 11,
    fontWeight: '700',
  },
  chatContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  promptsWrap: {
    gap: 8,
    marginBottom: 4,
  },
  sectionLabel: {
    paddingHorizontal: 6,
    color: '#8A7255',
    fontSize: 12,
    fontWeight: '700',
  },
  promptRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptChip: {
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#E9D8BD',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  promptText: {
    color: '#6E573B',
    fontSize: 12,
    fontWeight: '600',
  },
  bubbleRow: {
    flexDirection: 'row',
  },
  bubbleRowLeft: {
    justifyContent: 'flex-start',
  },
  bubbleRowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '84%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  aiBubble: {
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#E9D8BD',
  },
  userBubble: {
    backgroundColor: '#C68B2F',
  },
  bubbleText: {
    color: '#3D2108',
    fontSize: 14,
    lineHeight: 20,
  },
  userBubbleText: {
    color: '#FFF',
  },
  inputWrap: {
    margin: 12,
    borderRadius: 16,
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#E9D8BD',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 14,
    color: '#3D2108',
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C68B2F',
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
});
