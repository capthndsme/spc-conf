// GlobalKeyboard.tsx
import React, { useEffect, useState, useRef, useMemo } from 'react'; // Added useMemo
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

import { ChevronDown } from 'lucide-react';
import { useTransition, animated, config } from '@react-spring/web';
import {
    useDashContext,
    // Import the maps from DashWrap (or define them here if preferred)
    kbdBg200Map,
    kbdBg300Map,
    kbdBg500Map,
    kbdActiveBg400Map,
    kbdBorder300Map,
    kbdBorder400Map,
    kbdBorder600Map
} from './DashWrap';

// Define keyboard layout and display options (keep as is)
const keyboardLayout = {
    default: [
        "q w e r t y u i o p",
        "a s d f g h j k l",
        "{shift} z x c v b n m {bksp}",
        "{numbers} {space} {enter}"
    ],
    shift: [
        "Q W E R T Y U I O P",
        "A S D F G H J K L",
        "{shift} Z X C V B N M {bksp}",
        "{numbers} {space} {enter}"
    ],
    numbers: [
        "1 2 3 4 5 6 7 8 9 0",
        "- / : ; ( ) $ & @",
        "{more} . , ? ! ' {bksp}",
        "{default} {space} {enter}"
    ],
    more: [
        "[ ] { } # % ^ * + =",
        "_ \\ | ~ < > € £ ¥",
        "{default} . , ? ! ' {bksp}",
        "{abc} {space} {enter}"
    ],
    numpad: [
        "1 2 3",
        "4 5 6",
        "7 8 9",
        "{bksp} 0 {enter}"
    ]
};

const keyboardDisplay = {
    "{bksp}": "⌫",
    "{enter}": "return",
    "{shift}": "⇧",
    "{space}": " ",
    "{numbers}": "123",
    "{default}": "ABC",
    "{abc}": "ABC",
    "{more}": "#+="
};

// Helper function to programmatically set input value and trigger React's onChange
function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (valueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter?.call(element, value);
  } else {
    valueSetter?.call(element, value);
  }

  // Dispatch 'input' event to notify React and other listeners
  element.dispatchEvent(new Event('input', { bubbles: true }));
}


export const GlobalKeyboard: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false); // Start hidden
    const [layoutName, setLayoutName] = useState("default");
    const { tailwindColor } = useDashContext(); // Get the theme color
    const [targetInput, setTargetInput] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
    const [currentInputValue, setCurrentInputValue] = useState("");
    const keyboardRef = useRef<any>(null);
    const keyboardElementRef = useRef<HTMLDivElement>(null)

    const changeLayout = (newLayout: string) => setLayoutName(newLayout);
    const hideKeyboard = () => {
        setIsVisible(false)
        if (targetInput) {
            targetInput.blur();
        }
        setTargetInput(null);
    }

    useEffect(() => {
        const evtHandler = (e: Event) => {
            console.log("Detect blur on el", e)
            if (e.type === "blur") hideKeyboard();
        }
        const domRemovedHandler = (e: Event) => {
            console.log("Detect dom remove on el", e)
            if (e.type === "DOMNodeRemoved") hideKeyboard();
        }

        if (targetInput) {
            targetInput.addEventListener('blur', evtHandler);
            targetInput.addEventListener('DOMNodeRemoved', domRemovedHandler);
        }
        return () => {
            if (targetInput) {
                targetInput.removeEventListener('blur', evtHandler);
                targetInput.removeEventListener('DOMNodeRemoved', domRemovedHandler);
            }
        }
    }, [targetInput])

    useEffect(() => {
        const handleFocusIn = (event: FocusEvent) => {
            const target = event.target;
            if (
                (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) &&
                !target.readOnly &&
                !target.disabled &&
                !(target.closest('.react-simple-keyboard'))
            ) {
                console.log("Focus IN detected on:", target);
                setTargetInput(target);
                setCurrentInputValue(target.value);
                setIsVisible(true);

                if (keyboardElementRef.current) {
                    const keyboardHeight = keyboardElementRef.current.offsetHeight;
                    const targetRect = target.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const scrollableParent = (function getScrollableParent(node: HTMLElement | null): HTMLElement | null {
                        if (!node || node === document.body) return document.body;
                        const style = window.getComputedStyle(node);
                        const overflowY = style.getPropertyValue('overflow-y');
                        if (overflowY === 'auto' || overflowY === 'scroll') return node;
                        return getScrollableParent(node.parentElement);
                    })(target.parentElement);
                    if (scrollableParent) {
                        const scrollableRect = scrollableParent.getBoundingClientRect();
                        const targetBottom = targetRect.bottom;
                        const keyboardTop = viewportHeight - keyboardHeight;
                        const targetBottomInScrollable = targetBottom - scrollableRect.top;
                        const keyboardTopInScrollable = keyboardTop - scrollableRect.top;
                        if (targetBottomInScrollable > keyboardTopInScrollable) {
                            const scrollAmount = targetBottomInScrollable - keyboardTopInScrollable + 10;
                            scrollableParent.scrollBy({ top: scrollAmount, behavior: 'smooth' });
                        }
                    }
                }


                if (target instanceof HTMLInputElement && target.type === 'number') {
                    setLayoutName('numpad');
                } else if (layoutName === 'numpad') {
                    setLayoutName('default');
                }
            } else {
                 // @ts-ignore
                if (targetInput && !event.relatedTarget?.closest('.react-simple-keyboard')) {
                    // console.log("Focus moved away from trackable input");
                    // Potentially hide keyboard here if desired, but keeping it visible on blur for now
                }
            }
        };

        document.addEventListener('focusin', handleFocusIn);

        return () => {
            document.removeEventListener('focusin', handleFocusIn);
        };
    }, [targetInput, layoutName]); // Removed dash context dependency here as it doesn't influence focus logic directly

    useEffect(() => {
        if (!targetInput) return;

        const handleExternalInput = (event: Event) => {
            const target = event.target as HTMLInputElement | HTMLTextAreaElement;
            setCurrentInputValue(target.value);
            if (keyboardRef.current) {
                 keyboardRef.current.setInput(target.value);
            }
        };

        targetInput.addEventListener('input', handleExternalInput);

        return () => {
            targetInput.removeEventListener('input', handleExternalInput);
        };
    }, [targetInput]);

    const transitions = useTransition(isVisible, {
        from: { transform: 'translateY(100%)' },
        enter: { transform: 'translateY(0%)' },
        leave: { transform: 'translateY(100%)' },
        config: { bounce: 0, ...config.stiff },
    });

    const onKeyPress = (button: string) => {
        console.log("Button pressed:", button, "on layout:", layoutName);

        if (!targetInput) return;

        try {
            const tg = targetInput
            if (tg && tg !== null) {
                 tg.click(); // Keep trying to click
                if (button === "{enter}") {
                    const enterEvent = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        bubbles: true,
                        cancelable: true,
                    });
                    tg.dispatchEvent(enterEvent);
                    // Decide if enter *always* hides keyboard or only sometimes
                    // hideKeyboard(); // Keep previous behaviour for enter
                    // targetInput.blur(); // Keep previous behaviour for enter
                    return; // Return after dispatching enter event
                }
            }
        } catch (e) {
            console.warn("Failure invoking click on target input with code", e)
        }

        if (button === "{shift}") {
            changeLayout(layoutName === "default" ? "shift" : "default");
            return;
        }
        if (button === "{numbers}") {
            changeLayout("numbers");
            return;
        }
        if (button === "{default}" || button === "{abc}") {
            changeLayout("default");
            return;
        }
        if (button === "{more}") {
            changeLayout("more");
            return;
        }
        if (button === "{enter}") { // Handle enter's primary action (if not handled above)
            hideKeyboard();
            targetInput.blur();
            return;
        }


        const currentValue = targetInput.value;
        let selectionStart = targetInput.selectionStart ?? currentValue.length;
        let selectionEnd = targetInput.selectionEnd ?? currentValue.length;
        let newValue = currentValue;
        let newCursorPos = selectionStart;

        if (button === "{bksp}") {
            if (selectionStart === selectionEnd && selectionStart > 0) {
                newValue = currentValue.substring(0, selectionStart - 1) + currentValue.substring(selectionEnd);
                newCursorPos = selectionStart - 1;
            } else if (selectionStart !== selectionEnd) {
                newValue = currentValue.substring(0, selectionStart) + currentValue.substring(selectionEnd);
                newCursorPos = selectionStart;
            }
        } else if (button === "{space}") {
             newValue = currentValue.substring(0, selectionStart) + " " + currentValue.substring(selectionEnd);
             newCursorPos = selectionStart + 1;
        }
        else if (!button.startsWith("{") || button.length > 3) {
            let charToInsert = button;
             newValue = currentValue.substring(0, selectionStart) + charToInsert + currentValue.substring(selectionEnd);
             newCursorPos = selectionStart + charToInsert.length;
        } else {
             console.log("Unhandled special key:", button);
             return;
        }

        setNativeValue(targetInput, newValue);

         targetInput.focus();
         requestAnimationFrame(() => {
            try {
                targetInput.setSelectionRange(newCursorPos, newCursorPos);
            } catch (e) {
                console.warn("Could not set selection range:", e);
            }
         });

        setCurrentInputValue(newValue);
    };

    // --- Dynamic Button Theme ---
    const buttonTheme = useMemo(() => {
        const color = tailwindColor; // Get current theme color
        return [
            {
                class: `${kbdBg200Map[color]} text-black ${kbdBorder300Map[color]} ${kbdActiveBg400Map[color]} !text-xl !h-11 !w-10`,
                buttons: "q w e r t y u i o p a s d f g h j k l z x c v b n m Q W E R T Y U I O P A S D F G H J K L Z X C V B N M 1 2 3 4 5 6 7 8 9 0 - / : ; ( ) $ & @ _ \\ | ~ < > € £ ¥ [ ] { } # % ^ * + = . , ? ! '"
            },
            {
                class: `${kbdBg300Map[color]} text-black ${kbdBorder400Map[color]} ${kbdActiveBg400Map[color]} !text-xl !h-11 !w-10`,
                buttons: "{bksp} {shift} {numbers} {default} {more} {abc}"
            },
            {
                buttons: "{space}",
                class: `!grow ${kbdBg200Map[color]} ${kbdBorder300Map[color]} ${kbdActiveBg400Map[color]} !text-xl !h-11 !w-10`
            },
            {
                buttons: '{numbers} {default} {abc} {more}', // Exclude enter here to allow specific styling
                class: `!basis-1/4 !grow-0 ${kbdActiveBg400Map[color]} !text-xl !h-11` // Basic width/active controls
            },
            {
                buttons: "{enter}", // Specific enter style
                class: `${kbdBg500Map[color]} !text-white ${kbdBorder600Map[color]} !basis-1/4 !grow-0 ${kbdActiveBg400Map[color]} !text-xl !h-11 !w-10`
            }
        ];
    }, [tailwindColor]); // Recalculate theme only when tailwindColor changes

    // Get the background class for the main keyboard container
    const keyboardContainerBgClass = kbdBg300Map[tailwindColor];

    return transitions((style, item) =>
        item ? (
            // @ts-ignore
            <animated.div
                style={style}
                ref={keyboardElementRef}
                className={`fixed bottom-0 left-0 right-0 z-50 w-full ${keyboardContainerBgClass}`} // Use dynamic background
                // @ts-ignore
                onMouseDown={(e) => e.preventDefault()}
            >
                {/* Hide button */}
                <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 p-2 cursor-pointer' onClick={hideKeyboard}>
                    <ChevronDown size={32} className="bg-gray-300 bg-opacity-50 rounded-full" />
                </div>
                {/* Keyboard */}
                <div className={`w-full ${layoutName === "numpad" ? `max-w-xs` : `max-w-lg`} mx-auto`}>
                    <Keyboard
                        keyboardRef={r => (keyboardRef.current = r)}
                        theme="hg-theme-default !bg-transparent" // Keyboard base is transparent, container div has color
                        layout={keyboardLayout}
                        display={keyboardDisplay}
                        layoutName={layoutName}
                        onKeyPress={onKeyPress}
                        inputValue={currentInputValue}
                        buttonTheme={buttonTheme} // Apply dynamic theme
                        syncInstanceInputs={true}
                    />
                    <div className='text-center text-black text-xs pb-1'>SafeDrop secure keyboard</div>
                </div>
            </animated.div>
        ) : null
    );
};

// Note: Removed the duplicate KeyboardProvider import/wrapping logic
// If KeyboardProvider is needed specifically for react-simple-keyboard interaction,
// consult its documentation. It might wrap the Keyboard component itself or be unnecessary
// if interaction is handled manually via refs and event listeners as done here.