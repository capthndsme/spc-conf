import React, { createContext, useState, useRef, useCallback, useContext, ReactNode } from 'react';
import { KeyboardReactInterface } from 'react-simple-keyboard';

interface KeyboardContextProps {
  // Modified showKeyboard signature
  showKeyboard: (
    inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>,
    initialValue?: string,
    layout?: string // Optional layout name
   ) => void;
  hideKeyboard: () => void;
  changeLayout: (layoutName: string) => void;
  setLayoutInput: (value: string) => void;
  setKeyboardRef: (ref: KeyboardReactInterface | null) => void;
  isVisible: boolean;
  layoutName: string;
  inputValue: string;
  keyboardRef: React.MutableRefObject<KeyboardReactInterface | null>;
  activeInputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement> | null;
}

const KeyboardContext = createContext<KeyboardContextProps | undefined>(undefined);

interface KeyboardProviderProps {
  children: ReactNode;
}

export const KeyboardProvider: React.FC<KeyboardProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false); // Default to hidden
  const [layoutName, setLayoutName] = useState("default");
  const [inputValue, setInputValue] = useState("");
  const activeInputRef = useRef<React.RefObject<HTMLInputElement | HTMLTextAreaElement> | null>(null);
  const keyboardInstanceRef = useRef<KeyboardReactInterface | null>(null);

  const showKeyboard = useCallback((
    inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>,
    initialValue: string = '',
    layout: string = 'default' // Accept layout, default to 'default'
   ) => {
    activeInputRef.current = inputRef;
    setInputValue(initialValue);
    setLayoutName(layout); // Set the requested layout
    setIsVisible(true);
    // Optional: focus input (might cause issues on some mobile browsers)
    // inputRef.current?.focus();
  }, []);

  const hideKeyboard = useCallback(() => {
    setIsVisible(false);
    // --- FIX for "stuck input" ---
    // Clear the keyboard's internal value when it's hidden
    // This prevents the old value from showing momentarily if another input is focused quickly
    setInputValue("");
    // --- End Fix ---
    activeInputRef.current = null; // Clear the active input ref
  }, []);

  const changeLayout = useCallback((newLayout: string) => {
    setLayoutName(newLayout);
  }, []);

  const setLayoutInput = useCallback((value: string) => {
    setInputValue(value); // Update keyboard's internal value display

    // Update the actual input element's value only if it's still the active one
    if (activeInputRef.current && activeInputRef.current.current) {
        activeInputRef.current.current.value = value;
        const eventOptions = { bubbles: true, cancelable: true };
        activeInputRef.current.current.dispatchEvent(new Event('input', eventOptions));
        activeInputRef.current.current.dispatchEvent(new Event('change', eventOptions));
    }
  }, []); // Dependency array is empty, relies on refs and state setters

  const setKeyboardRef = useCallback((ref: KeyboardReactInterface | null) => {
     keyboardInstanceRef.current = ref;
  }, []);


  return (
    <KeyboardContext.Provider value={{
      showKeyboard,
      hideKeyboard,
      changeLayout,
      setLayoutInput,
      setKeyboardRef,
      isVisible,
      layoutName,
      inputValue,
      keyboardRef: keyboardInstanceRef,
      activeInputRef: activeInputRef.current // Provide read-only access if needed
    }}>
      {children}
    </KeyboardContext.Provider>
  );
};

export const useKeyboard = (): KeyboardContextProps => {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error('useKeyboard must be used within a KeyboardProvider');
  }
  return context;
};