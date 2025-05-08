import React, { useRef, useCallback, useEffect } from 'react';
import { useKeyboard } from './KeyboardContext'; // Adjust path as needed

// Interface for the options passed to the hook
interface UseKeyboardInputOptions {
    initialValue?: string;
    layout?: string; // Add layout option (e.g., 'default', 'numpad')
}

// Interface for the props returned by the hook
interface KeyboardInputProps {
  ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  onFocus: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  readOnly?: boolean; // Keep default as true
  inputMode?: "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url"; // Good practice
  // Add other native input props if needed
}

// The hook itself
export const useKeyboardInput = (
    { initialValue, layout = 'default' }: UseKeyboardInputOptions = {} // Use object destructuring for options
): KeyboardInputProps => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  // Get needed functions and state from context
  const { showKeyboard, isVisible, activeInputRef } = useKeyboard();

  // Refs to store potentially changing props to avoid stale closures
  const initialValueRef = useRef(initialValue);
  const layoutRef = useRef(layout);

  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // --- Refined Focus Logic ---
    // Prevent re-showing keyboard if it's already visible *for this specific input*
    if (isVisible && activeInputRef?.current === inputRef.current) {
       console.log("Focus event on already active input, keyboard visible. Doing nothing.");
       return;
    }
    // --- End Refined Logic ---

    // Always use the current value from the input element itself on focus
    const currentValue = event.currentTarget.value ?? '';
    // Show the keyboard, passing the specific input ref, its current value, and the desired layout
    console.log(`Showing keyboard for layout: ${layoutRef.current}`);
    // @ts-ignore
    showKeyboard(inputRef, currentValue, layoutRef.current); // Pass layout from ref

  }, [showKeyboard, isVisible, activeInputRef]); // Dependencies

  // Optional: Add a blur handler if you want to hide the keyboard when ANY keyboard-linked input loses focus.
  // Be careful with this, as clicking *between* keyboard-linked inputs might cause flicker.
  // const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   // Use setTimeout to allow focus to shift to another element (like another keyboard input or the keyboard itself)
  //   setTimeout(() => {
  //     // Check if the new focused element is *not* the keyboard container or another input using our hook
  //     // This logic can get complex. Often, relying on the explicit hide button or enter key is simpler.
  //     // A basic check: if the keyboard is visible AND the currently active *document* element is not our input
  //     if (isVisible && document.activeElement !== inputRef.current) {
  //        // Maybe hide? Needs careful testing.
  //        // hideKeyboard();
  //     }
  //   }, 0);
  // }, [isVisible, hideKeyboard]);


  // Return props to be spread onto the input element
  return {
    // @ts-ignore
    ref: inputRef,
    onFocus: handleFocus,
    // onBlur: handleBlur, // Optional blur handling
    readOnly: true,        // Prevent native keyboard strongly
    inputMode: 'none',     // Further discourages native keyboard on mobile
  };
};