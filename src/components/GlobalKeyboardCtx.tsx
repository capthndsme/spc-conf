import React from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { useKeyboard } from './KeyboardContext'; // Adjust path as needed
import { ChevronDown } from 'lucide-react';
import { useTransition, animated, config } from '@react-spring/web';

// Define keyboard layout and display options
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
    // --- NEW NUMPAD LAYOUT ---
    numpad: [
        "7 8 9",
        "4 5 6",
        "1 2 3",
        "{bksp} 0 {enter}" // Simple numpad with backspace, 0, and enter
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


export const GlobalKeyboard: React.FC = () => {
  const {
    isVisible,
    hideKeyboard,
    layoutName,
    changeLayout,
    inputValue,      // Use the value from context
    setLayoutInput, // Use the setter from context
    setKeyboardRef   // Function to set the keyboard instance ref in context
   } = useKeyboard();

   // --- react-spring transition ---
   const transitions = useTransition(isVisible, {
        from: {  transform: 'translateY(100%)' },
        enter: { transform: 'translateY(0%)' },
        leave: {  transform: 'translateY(100%)' },
        config: {bounce: 0, ...config.stiff},
        // delay: 100
   });
   // --- End react-spring transition ---

  const onChange = (input: string) => {
    setLayoutInput(input); // Update context and the target input
  };

  const onKeyPress = (button: string) => {
    console.log("Button pressed", button, "on layout", layoutName);

    // Layout switching logic remains largely the same
    if (button === "{shift}") {
      changeLayout(layoutName === "default" ? "shift" : "default");
    } else if (button === "{numbers}") {
      changeLayout("numbers");
    } else if (button === "{default}" || button === "{abc}") { // Handle {abc} too
      changeLayout("default");
    } else if (button === "{more}") {
      changeLayout("more");
    } else if (button === "{enter}") {
        hideKeyboard(); // Hide keyboard on enter
        // Optionally trigger form submission etc.
    } else if (button === "{bksp}") {
        // Handled by onChange
    }
    // No specific handling needed for numpad layout switching *from* numpad,
    // as it only contains numbers, bksp, and enter in this design.
    // Showing the numpad is handled by the input focus.
  };

  // Make sure the button themes cover the numpad keys (0-9, {bksp}, {enter})
  // The existing themes likely already do. Double check digits 0-9 are in the first rule.
  const buttonTheme = [
        {
            class: "!bg-blue-200 text-black !border-blue-300",
            // Ensure all digits 0-9 are covered
            buttons: "q w e r t y u i o p a s d f g h j k l z x c v b n m Q W E R T Y U I O P A S D F G H J K L Z X C V B N M 1 2 3 4 5 6 7 8 9 0 - / : ; ( ) $ & @ _ \\ | ~ < > € £ ¥ [ ] { } # % ^ * + = . , ? ! '"
        },
        {
            class: "!bg-blue-300 text-black !border-blue-400",
            buttons: "{bksp} {shift} {numbers} {default} {more} {abc}"
        },
        {
            buttons: "{space}",
            class: "!grow !bg-blue-200 !border-blue-300"
        },
        {
            // Ensure enter is covered here if needed for sizing
            buttons: '{enter} {numbers} {default} {abc} {more}',
            class: "!basis-1/4 !grow-0"
        },
        {
            buttons: "{enter}", // Separate rule for specific enter style
            class: "!bg-blue-500 !text-white !border-blue-600" // Specific enter style
        }
    ];

  return transitions((style, item) =>
    item ? (
      // @ts-ignore --- react-spring types might still be adjusting to React 19+
      <animated.div
            style={style}
            className="fixed bottom-0 left-0 right-0 z-50 w-full bg-blue-300 " 
        >
            {/* Hide button */}
            <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 p-2 cursor-pointer' onClick={() => hideKeyboard()}> {/* Centered above */}
                <ChevronDown size={32} className="bg-gray-300 bg-opacity-50 rounded-full"/>
            </div>
            {/* Keyboard */}
            <div className='w-full max-w-md mx-auto'> {/* Adjusted max-width */}
                <Keyboard
                    keyboardRef={r => setKeyboardRef(r)}
                    theme="hg-theme-default !bg-blue-300"
                    layout={keyboardLayout}
                    display={keyboardDisplay}
                    layoutName={layoutName} // Controlled by context
                    onChange={onChange}
                    onKeyPress={onKeyPress}
                    inputName="keyboardInput" // Can be fixed
                    inputValue={inputValue}    // Controlled by context
                    buttonTheme={buttonTheme}
                    useTouchEvents={true}
                    // Prevent accidental text selection on rapid taps
                    disableButtonHold={true}
                />
            </div>
        </animated.div>
    ) : null
  );
};