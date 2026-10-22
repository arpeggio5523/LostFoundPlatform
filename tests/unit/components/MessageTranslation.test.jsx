import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import MessageTranslation from "../../../src/components/MessageTranslation";
import { translateMessage } from "../../../src/services/messagesApi";

vi.mock("../../../src/services/messagesApi", () => ({ translateMessage: vi.fn() }));
const message = { _id: "message-1", text: "Hello" };
const languageState = vi.hoisted(() => ({ language: "en" }));
vi.mock("../../../src/context/LanguageContext", () => ({ useLanguage: () => ({ language: languageState.language, t: (key) => key }) }));
beforeEach(() => { vi.clearAllMocks(); languageState.language = "en"; });

it("translates on demand and toggles back without another request", async () => {
  translateMessage.mockResolvedValue({ translatedText: "Helo", targetLanguage: "ms" });
  render(<MessageTranslation message={message} conversationId="conversation-1" />);
  expect(translateMessage).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "See translation" }));
  expect(await screen.findByText("Helo")).toHaveAttribute("lang", "ms");
  expect(translateMessage).toHaveBeenCalledWith("conversation-1", "message-1", "en");
  fireEvent.click(screen.getByRole("button", { name: "See original" }));
  expect(screen.getByText("Hello")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "See translation" }));
  expect(screen.getByText("Helo")).toBeInTheDocument();
  expect(translateMessage).toHaveBeenCalledTimes(1);
  expect(message.text).toBe("Hello");
});

it("disables the action during translation", async () => {
  let resolve;
  translateMessage.mockReturnValue(new Promise((done) => { resolve = done; }));
  render(<MessageTranslation message={message} conversationId="conversation-1" />);
  fireEvent.click(screen.getByRole("button", { name: "See translation" }));
  expect(screen.getByRole("button", { name: "Translating..." })).toBeDisabled();
  resolve({ translatedText: "Helo", targetLanguage: "ms" });
  await screen.findByRole("button", { name: "See original" });
});

it("keeps the original on failure and allows retry", async () => {
  translateMessage.mockRejectedValueOnce(new Error("Translation unavailable"))
    .mockResolvedValueOnce({ translatedText: "Helo", targetLanguage: "ms" });
  render(<MessageTranslation message={message} conversationId="conversation-1" />);
  fireEvent.click(screen.getByRole("button", { name: "See translation" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Translation unavailable");
  expect(screen.getByText("Hello")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "See translation" }));
  await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  expect(await screen.findByText("Helo")).toBeInTheDocument();
});

it("uses the current website language and clears translations when it changes", async () => {
  translateMessage.mockResolvedValueOnce({ translatedText: "English result", targetLanguage: "en" })
    .mockResolvedValueOnce({ translatedText: "Chinese result", targetLanguage: "zh-CN" });
  const { rerender } = render(<MessageTranslation message={message} conversationId="conversation-1" />);
  fireEvent.click(screen.getByRole("button", { name: "See translation" }));
  await screen.findByText("English result");
  languageState.language = "zh";
  rerender(<MessageTranslation message={message} conversationId="conversation-1" />);
  expect(screen.queryByText("English result")).not.toBeInTheDocument();
  expect(screen.getByText("Hello")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "See translation" }));
  await screen.findByText("Chinese result");
  expect(translateMessage).toHaveBeenLastCalledWith("conversation-1", "message-1", "zh-CN");
});
