import React, { useState, useRef } from "react";

import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

// Tipo da mensagem
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export default function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      text: "Olá! Posso te ajudar com o agendamento na Barbearia 💈. Me diga o que você deseja.",
    },
  ]);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const contextId = "sessao-anonima-app";

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    Keyboard.dismiss();

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
//  -- http://10.244.134.77:3000
    const apiURL =
      Platform.OS === "android"
        ? "http://10.53.54.33:3000"
        : "http://127.0.0.1:3000";

    try {
      const response = await fetch(`${apiURL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          contextId,
        }),
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: "assistant",
        text:
          data?.message ||
          "Desculpe, não consegui obter resposta agora...",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 2),
          role: "assistant",
          text: "Erro ao conectar com o servidor",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }

  function renderItem({ item }: { item: ChatMessage }) {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageContainer,
          isUser
            ? styles.userMessageContainer
            : styles.assistantMessageContainer,
        ]}
      >
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {item.text}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Barbearia Agenda</Text>
          <Text style={styles.headerSubtitle}>Assistente Virtual</Text>
        </View>

        {/* Chat */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />

        {/* Loading */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator />
            <Text style={{ marginLeft: 8 }}>Aguarde...</Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Ex.: Quero agendar um horário"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={loading}
          >
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: "#000",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#ccc",
    fontSize: 12,
  },
  listContent: {
    padding: 12,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: "80%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  assistantMessageContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e5ea",
  },
  messageText: {
    color: "#000",
  },
  userMessageText: {
    color: "#fff",
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  inputArea: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 8,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});