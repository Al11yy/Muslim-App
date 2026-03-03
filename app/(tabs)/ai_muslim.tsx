import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { GoogleGenAI } from '@google/genai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GEMINI_API_KEY_STORAGE_KEY = '@gemini_api_key';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'model';
  timestamp: Date;
}

export default function AiMuslimScreen() {
  const router = useRouter();
  const appTheme = useAppTheme();

  const theme = useMemo(
    () => ({
      bg: appTheme.bg,
      surface: appTheme.surface,
      softSurface: appTheme.softSurface,
      border: appTheme.border,
      text: appTheme.text,
      muted: appTheme.muted,
      gold: appTheme.gold,
      card: appTheme.card,
      cardBorder: appTheme.cardBorder,
      userBubble: appTheme.gold,
      userText: '#FFFFFF',
      modelBubble: appTheme.card,
      statusDot: appTheme.isDark ? '#63BF72' : '#3FA860',
      overlay: appTheme.isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.2)',
    }),
    [appTheme]
  );

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const composerOffset = isKeyboardVisible ? 6 : 10;

  const [apiKey, setApiKey] = useState<string>('');
  const [tempApiKey, setTempApiKey] = useState<string>('');
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [isLoadingKey, setIsLoadingKey] = useState<boolean>(true);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  
  const systemInstruction = `Kamu adalah seorang asisten AI Muslim yang ramah, sopan, dan berpengetahuan luas tentang agama Islam. 
Tujuan utamamu adalah membantu pengguna memahami ajaran Islam (Al-Quran, Hadits, Fiqih, Sejarah Islam) dengan bahasa yang mudah dipahami, penuh hikmah, dan menghindari perdebatan khilafiyah yang memecah belah. 
Berikan sumber (seperti nama surah/ayat atau perawi hadits) jika mengutip dalil. 
Gunakan salam Islami jika disapa. Jika ditanya hal di luar Islam, jawab dengan sopan tapi tetap arahkan ke nilai-nilai kebaikan. Pendek dan ringkas jika pertanyaannya sederhana, detail jika butuh penjelasan.
aku juga ingin kamu untuk menanyakan terlebih dahulu dengan "apakah kamu pak rafly? jwb dengan ya atau tidak" jika pengguna menjawab ya maka kamu boleh menggunakan sifat dan bahasa seperti caracter anime stundere, jadi kamu akan bersikap seperti karakter anime stundere yang kadang jutek bangett dan nyebelin.
jika pengguna menjawab tidak maka kamu kembali menjadi normal seperti semula.`;

  useEffect(() => {
    loadApiKey();
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const loadApiKey = async () => {
    try {
      const storedKey = await AsyncStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
      if (storedKey) {
        setApiKey(storedKey);
      } else {
        setShowConfigModal(true);
      }
    } catch (e) {
      console.error('Failed to load API key', e);
    } finally {
      setIsLoadingKey(false);
    }
  };

  const saveApiKey = async () => {
    if (!tempApiKey.trim()) return;
    try {
      await AsyncStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, tempApiKey.trim());
      setApiKey(tempApiKey.trim());
      setShowConfigModal(false);
    } catch (e) {
      console.error('Failed to save API key', e);
    }
  };

  const removeApiKey = async () => {
    try {
      await AsyncStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
      setApiKey('');
      setTempApiKey('');
      setMessages([]);
      setShowConfigModal(true);
    } catch (e) {
      console.error('Failed to remove API key', e);
    }
  };

  const openConfigModal = () => {
    setTempApiKey(apiKey);
    setShowConfigModal(true);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/Home');
  };

  const handleSend = async () => {
    if (!inputText.trim() || !apiKey || isGenerating) return;

    const userText = inputText.trim();
    setInputText('');
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsGenerating(true);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const historyMsg = messages.map(m => ({
        role: m.sender,
        parts: [{ text: m.text }]
      }));

      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
          },
          history: historyMsg
      });

      const response = await chat.sendMessage({ message: userText });
      const modelText = response.text || 'Maaf, saya tidak dapat memproses permintaan tersebut.';
      
      const newModelMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: modelText,
        sender: 'model',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newModelMsg]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      let errorMsg = 'Maaf, terjadi kesalahan tak terduga. Silakan coba lagi.';
      if (error?.message?.includes('API key not valid')) {
        errorMsg = 'API Key tidak valid. Silakan periksa kembali API Key Anda di pengaturan.';
      }
      
      const newErrorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMsg,
        sender: 'model',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newErrorMsg]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ─── RENDER BUBBLE CHAT ───
  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowBot]}>
        {!isUser && (
          <View style={[styles.avatarBox, { borderColor: theme.border, backgroundColor: theme.modelBubble }]}>
            <Image 
              source={require('../../assets/images/logo-AlUkhuwah-noBg-ai.png')} 
              style={styles.avatarImg} 
              resizeMode="contain"
            />
          </View>
        )}

        <View 
          style={[
            styles.bubble, 
            isUser 
              ? [styles.bubbleUser, { backgroundColor: theme.userBubble }] 
              : [styles.bubbleBot, { backgroundColor: theme.modelBubble, borderColor: theme.border }]
          ]}
        >
          <Text style={[styles.bubbleText, { color: isUser ? theme.userText : theme.text }]}>
            {item.text}
          </Text>
          <Text style={[styles.bubbleTime, { color: isUser ? 'rgba(255,255,255,0.7)' : theme.muted }]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoadingKey) {
    return (
      <View style={[styles.centerScreen, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.gold} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]} edges={['top']}>
      <StatusBar style={appTheme.isDark ? 'light' : 'dark'} />

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.headerLeft}>
            <Pressable
              onPress={handleBack}
              hitSlop={10}
              style={[styles.backBtn, { borderColor: theme.border, backgroundColor: theme.softSurface }]}>
              <Ionicons name="chevron-back" size={20} color={theme.text} />
            </Pressable>

            <View style={styles.headerInfo}>
              <View style={[styles.headerAvatar, { borderColor: theme.border, backgroundColor: theme.modelBubble }]}>
                <Image
                  source={require('../../assets/images/logo-AlUkhuwah-noBg-ai.png')}
                  style={styles.headerAvatarImg}
                  resizeMode="contain"
                />
                <View style={[styles.statusDot, { backgroundColor: theme.statusDot, borderColor: theme.surface }]} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Al-Ukhuwah AI</Text>
                <Text style={[styles.headerSubtitle, { color: theme.muted }]}>Asisten Virtual Islami</Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={openConfigModal}
            hitSlop={10}
            style={[styles.iconBtn, { borderColor: theme.border, backgroundColor: theme.softSurface }]}
          >
            <Ionicons name="key-outline" size={22} color={theme.muted} />
          </Pressable>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[styles.listContent, { paddingBottom: 28 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconBox, { borderColor: theme.border, backgroundColor: theme.modelBubble }]}>
                <Image 
                  source={require('../../assets/images/logo-AlUkhuwah-noBg-ai.png')} 
                  style={{ width: 48, height: 48 }} 
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.emptyHead, { color: theme.text }]}>Assalamu'alaikum</Text>
              <Text style={[styles.emptySub, { color: theme.muted }]}>
                Mulai percakapan dengan bertanya seputar ibadah, tafsir Al-Quran, atau sejarah Islam.
              </Text>
            </View>
          }
          ListFooterComponent={
            isGenerating ? (
              <View style={styles.typingRow}>
                <View style={[styles.avatarBox, { borderColor: theme.border, backgroundColor: theme.modelBubble }]}>
                  <Image 
                    source={require('../../assets/images/logo-AlUkhuwah-noBg-ai.png')} 
                    style={styles.avatarImg} 
                    resizeMode="contain"
                  />
                </View>
                <View style={[styles.typingBox, { borderColor: theme.border, backgroundColor: theme.modelBubble }]}>
                  <ActivityIndicator size="small" color={theme.gold} />
                  <Text style={[styles.typingText, { color: theme.muted }]}>Menulis balasan...</Text>
                </View>
              </View>
            ) : null
          }
        />

        <View
          style={[
            styles.inputSection,
            {
              backgroundColor: theme.bg,
              borderTopColor: theme.border,
              marginBottom: composerOffset,
            },
          ]}>
          <View style={[styles.inputBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput
              style={[styles.textInput, { color: theme.text }]}
              placeholder="Tulis pertanyaanmu..."
              placeholderTextColor={theme.muted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <Pressable 
              style={[
                styles.sendBtn, 
                { backgroundColor: theme.gold, borderColor: theme.gold },
                (!inputText.trim() || isGenerating) && { opacity: 0.5 },
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isGenerating}
            >
              <Ionicons name="send" size={16} color="#FFF" />
            </Pressable>
          </View>
        </View>

      </KeyboardAvoidingView>

      <Modal visible={showConfigModal} animationType="fade" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
            <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Pengaturan API Key</Text>
              
              <Text style={[styles.modalDesc, { color: theme.muted }]}>
                Akses Gemini AI memerlukan API Key pribadi dari Google Studio. Key akan tersimpan aman di perangkat Anda.
              </Text>

              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.softSurface, color: theme.text, borderColor: theme.border }]}
                placeholder="Masukkan API Key (AIzaSy...)"
                placeholderTextColor={theme.muted}
                value={tempApiKey}
                onChangeText={setTempApiKey}
                secureTextEntry
                autoCapitalize="none"
              />

              <View style={styles.modalBtnRow}>
                {!!apiKey && (
                  <Pressable 
                    style={[styles.btnOutline, { borderColor: theme.border, backgroundColor: theme.softSurface }]}
                    onPress={removeApiKey}
                  >
                    <Text style={[styles.btnOutlineText, { color: theme.text }]}>Hapus</Text>
                  </Pressable>
                )}
                
                {!!apiKey && (
                  <Pressable 
                    style={[styles.btnOutline, { borderColor: theme.border, backgroundColor: theme.softSurface }]}
                    onPress={() => {
                        setShowConfigModal(false);
                        setTempApiKey('');
                    }}
                  >
                    <Text style={[styles.btnOutlineText, { color: theme.text }]}>Batal</Text>
                  </Pressable>
                )}

                <Pressable 
                  style={[styles.btnSolid, { backgroundColor: theme.gold }]}
                  onPress={saveApiKey}
                >
                  <Text style={styles.btnSolidText}>Simpan</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardContainer: {
    flex: 1,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    zIndex: 10,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerAvatarImg: {
    width: 26,
    height: 26,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'serif',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // LIST CHAT
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    maxWidth: '85%',
  },
  msgRowUser: {
    alignSelf: 'flex-end',
  },
  msgRowBot: {
    alignSelf: 'flex-start',
  },
  avatarBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarImg: {
    width: 16,
    height: 16,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bubbleUser: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    flex: 1,
    borderWidth: 1,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 6,
  },

  // TYPING
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  typingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },

  // EMPTY STATE
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '30%',
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyHead: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'serif',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },

  // INPUT
  inputSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    borderTopWidth: 1,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    paddingHorizontal: 6,
    paddingTop: 8, 
    paddingBottom: 8,
    fontSize: 15,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    marginBottom: 24,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btnOutline: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnOutlineText: {
    fontWeight: '700',
    fontSize: 14,
  },
  btnSolid: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSolidText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
