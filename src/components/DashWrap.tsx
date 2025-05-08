// DashWrap.tsx
import React, {
  useState,
  createContext,
  useContext,
  ReactNode, // Type for component children or elements
  Dispatch, // Type for state setter functions
  SetStateAction, // Type for state setter functions
  useMemo,
  useEffect
} from 'react';
import { Outlet } from "react-router-dom"; // Assuming react-router v6+
// NOTE: Removed duplicate KeyboardProvider import and commented-out lines
// import { KeyboardProvider } from './KeyboardContext'; // Assuming this is handled within GlobalKeyboard or elsewhere now
import { GlobalKeyboard } from './GlobalKeyboard';
import { WifiIcon } from 'lucide-react';
import { useDashPing } from '../api/useDashPing';

// 1. Define the Tailwind Color Type
export type TailwindColor =
  | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald'
  | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple'
  | 'fuchsia' | 'pink' | 'rose' | 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone';

// 2. Define the Mapping Objects for Tailwind classes
// Mappings for DashWrap layout background
const bg100Map: Record<TailwindColor, string> = {
  red: '!bg-red-100', orange: '!bg-orange-100', amber: '!bg-amber-100',
  yellow: '!bg-yellow-100', lime: '!bg-lime-100', green: '!bg-green-100',
  emerald: '!bg-emerald-100', teal: '!bg-teal-100', cyan: '!bg-cyan-100',
  sky: '!bg-sky-100', blue: '!bg-blue-100', indigo: '!bg-indigo-100',
  violet: '!bg-violet-100', purple: '!bg-purple-100', fuchsia: '!bg-fuchsia-100',
  pink: '!bg-pink-100', rose: '!bg-rose-100', slate: '!bg-slate-100',
  gray: '!bg-gray-100', zinc: '!bg-zinc-100', neutral: '!bg-neutral-100',
  stone: '!bg-stone-100',
};

const bg200Map: Record<TailwindColor, string> = {
  red: '!bg-red-200', orange: '!bg-orange-200', amber: '!bg-amber-200',
  yellow: '!bg-yellow-200', lime: '!bg-lime-200', green: '!bg-green-200',
  emerald: '!bg-emerald-200', teal: '!bg-teal-200', cyan: '!bg-cyan-200',
  sky: '!bg-sky-200', blue: '!bg-blue-200', indigo: '!bg-indigo-200',
  violet: '!bg-violet-200', purple: '!bg-purple-200', fuchsia: '!bg-fuchsia-200',
  pink: '!bg-pink-200', rose: '!bg-rose-200', slate: '!bg-slate-200',
  gray: '!bg-gray-200', zinc: '!bg-zinc-200', neutral: '!bg-neutral-200',
  stone: '!bg-stone-200',
};

// Mappings required for GlobalKeyboard theming (can also reside here or be defined within GlobalKeyboard)
export const kbdBg200Map: Record<TailwindColor, string> = {
  red: '!bg-red-200', orange: '!bg-orange-200', amber: '!bg-amber-200', yellow: '!bg-yellow-200',
  lime: '!bg-lime-200', green: '!bg-green-200', emerald: '!bg-emerald-200', teal: '!bg-teal-200',
  cyan: '!bg-cyan-200', sky: '!bg-sky-200', blue: '!bg-blue-200', indigo: '!bg-indigo-200',
  violet: '!bg-violet-200', purple: '!bg-purple-200', fuchsia: '!bg-fuchsia-200', pink: '!bg-pink-200',
  rose: '!bg-rose-200', slate: '!bg-slate-200', gray: '!bg-gray-200', zinc: '!bg-zinc-200',
  neutral: '!bg-neutral-200', stone: '!bg-stone-200',
};
export const kbdBg300Map: Record<TailwindColor, string> = {
  red: '!bg-red-300', orange: '!bg-orange-300', amber: '!bg-amber-300', yellow: '!bg-yellow-300',
  lime: '!bg-lime-300', green: '!bg-green-300', emerald: '!bg-emerald-300', teal: '!bg-teal-300',
  cyan: '!bg-cyan-300', sky: '!bg-sky-300', blue: '!bg-blue-300', indigo: '!bg-indigo-300',
  violet: '!bg-violet-300', purple: '!bg-purple-300', fuchsia: '!bg-fuchsia-300', pink: '!bg-pink-300',
  rose: '!bg-rose-300', slate: '!bg-slate-300', gray: '!bg-gray-300', zinc: '!bg-zinc-300',
  neutral: '!bg-neutral-300', stone: '!bg-stone-300',
};
export const kbdBg500Map: Record<TailwindColor, string> = {
  red: '!bg-red-500', orange: '!bg-orange-500', amber: '!bg-amber-500', yellow: '!bg-yellow-500',
  lime: '!bg-lime-500', green: '!bg-green-500', emerald: '!bg-emerald-500', teal: '!bg-teal-500',
  cyan: '!bg-cyan-500', sky: '!bg-sky-500', blue: '!bg-blue-500', indigo: '!bg-indigo-500',
  violet: '!bg-violet-500', purple: '!bg-purple-500', fuchsia: '!bg-fuchsia-500', pink: '!bg-pink-500',
  rose: '!bg-rose-500', slate: '!bg-slate-500', gray: '!bg-gray-500', zinc: '!bg-zinc-500',
  neutral: '!bg-neutral-500', stone: '!bg-stone-500',
};
export const kbdActiveBg400Map: Record<TailwindColor, string> = {
  red: '!active:bg-red-400', orange: '!active:bg-orange-400', amber: '!active:bg-amber-400', yellow: '!active:bg-yellow-400',
  lime: '!active:bg-lime-400', green: '!active:bg-green-400', emerald: '!active:bg-emerald-400', teal: '!active:bg-teal-400',
  cyan: '!active:bg-cyan-400', sky: '!active:bg-sky-400', blue: '!active:bg-blue-400', indigo: '!active:bg-indigo-400',
  violet: '!active:bg-violet-400', purple: '!active:bg-purple-400', fuchsia: '!active:bg-fuchsia-400', pink: '!active:bg-pink-400',
  rose: '!active:bg-rose-400', slate: '!active:bg-slate-400', gray: '!active:bg-gray-400', zinc: '!active:bg-zinc-400',
  neutral: '!active:bg-neutral-400', stone: '!active:bg-stone-400',
};
export const kbdBorder300Map: Record<TailwindColor, string> = {
  red: '!border-red-300', orange: '!border-orange-300', amber: '!border-amber-300', yellow: '!border-yellow-300',
  lime: '!border-lime-300', green: '!border-green-300', emerald: '!border-emerald-300', teal: '!border-teal-300',
  cyan: '!border-cyan-300', sky: '!border-sky-300', blue: '!border-blue-300', indigo: '!border-indigo-300',
  violet: '!border-violet-300', purple: '!border-purple-300', fuchsia: '!border-fuchsia-300', pink: '!border-pink-300',
  rose: '!border-rose-300', slate: '!border-slate-300', gray: '!border-gray-300', zinc: '!border-zinc-300',
  neutral: '!border-neutral-300', stone: '!border-stone-300',
};
export const kbdBorder400Map: Record<TailwindColor, string> = {
  red: '!border-red-400', orange: '!border-orange-400', amber: '!border-amber-400', yellow: '!border-yellow-400',
  lime: '!border-lime-400', green: '!border-green-400', emerald: '!border-emerald-400', teal: '!border-teal-400',
  cyan: '!border-cyan-400', sky: '!border-sky-400', blue: '!border-blue-400', indigo: '!border-indigo-400',
  violet: '!border-violet-400', purple: '!border-purple-400', fuchsia: '!border-fuchsia-400', pink: '!border-pink-400',
  rose: '!border-rose-400', slate: '!border-slate-400', gray: '!border-gray-400', zinc: '!border-zinc-400',
  neutral: '!border-neutral-400', stone: '!border-stone-400',
};
export const kbdBorder600Map: Record<TailwindColor, string> = {
  red: '!border-red-600', orange: '!border-orange-600', amber: '!border-amber-600', yellow: '!border-yellow-600',
  lime: '!border-lime-600', green: '!border-green-600', emerald: '!border-emerald-600', teal: '!border-teal-600',
  cyan: '!border-cyan-600', sky: '!border-sky-600', blue: '!border-blue-600', indigo: '!border-indigo-600',
  violet: '!border-violet-600', purple: '!border-purple-600', fuchsia: '!border-fuchsia-600', pink: '!border-pink-600',
  rose: '!border-rose-600', slate: '!border-slate-600', gray: '!border-gray-600', zinc: '!border-zinc-600',
  neutral: '!border-neutral-600', stone: '!border-stone-600',
};


// 3. Define the Context Structure
/**
 * DashContext provides shared state for the main dashboard layout.
 * - tailwindColor: The current theme color base.
 * - setTailwindColor: Function to update the theme color.
 * - leftSideElement: The dynamic content displayed in the left panel.
 * - setLeftSideElement: Function to update the left panel content.
 */
interface DashContextProps {
  tailwindColor: TailwindColor;
  setTailwindColor: Dispatch<SetStateAction<TailwindColor>>;
  leftSideElement: ReactNode;
  setLeftSideElement: Dispatch<SetStateAction<ReactNode>>;
}

// 4. Create the Context
const DashContext = createContext<DashContextProps | undefined>(undefined);

// 5. Create a Custom Hook for easy context consumption
export const useDashContext = () => {
  const context = useContext(DashContext);
  if (context === undefined) {
    throw new Error('useDashContext must be used within a DashProvider (likely DashWrap)');
  }
  return context;
};

// 6. Define the Default Left Side Content
const DefaultLeftSideContent: React.FC = () => (
  <div className=" ">
    <div className="text-3xl font-light">Smart Parcel</div>
    Unknown state.
    <br />
    <button onClick={() => { window.location.href = "/DashUIx" }} className='text-white'>Reload</button>
  </div>
);

// 7. Update DashWrap to be the Provider and use the mappings
const DashWrap = () => {
  // State managed by the provider (DashWrap)
  const [tailwindColor, setTailwindColor] = useState<TailwindColor>("pink");
  const [leftSideElement, setLeftSideElement] = useState<ReactNode>(<DefaultLeftSideContent />);

  const ping = useDashPing()
  const [reconnecting, setReconnecting] = useState(true);

  // Calculate background classes using the maps and local state
  const background100Class = bg100Map[tailwindColor];
  const background200Class = bg200Map[tailwindColor];

  // Value object to pass down through context
  const contextValue = useMemo(() => ({
    tailwindColor,
    setTailwindColor,
    leftSideElement,
    setLeftSideElement
  }), [tailwindColor]); // Dependencies: Recreate only if these change

  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        await ping.mutateAsync()
        setReconnecting(false)
        setAttempts(0)
      } catch (e) {
        setAttempts(a => a + 1)
        if (attempts > 2) {
          setReconnecting(true)
        }
      }
    }, 1000)
    return () => clearInterval(t)
  }, [attempts])


  return (
    // Provide the context value to children
    <DashContext.Provider value={contextValue}>
      {
        reconnecting && (
          <div className={'fixed z-10 left-0 top-0 flex-col w-full h-full flex items-center justify-center text-black text-2xl ' + background200Class}>

            <WifiIcon className='animate-ping mb-4' />
            <div>System Processing</div>
            <div>Please wait...</div>

          </div>
        )
      }
      {/* Removed KeyboardProvider and GlobalKeyboard from here, assuming GlobalKeyboard handles its own context or is global */}
      {/* <KeyboardProvider> Re-add if needed outside GlobalKeyboard */}
      <GlobalKeyboard /> {/* GlobalKeyboard now likely uses useDashContext inside */}
      <div className={`${background100Class}`}>
        <div className={` text-black w-full min-w-full min-h-svh h-full flex flex-col md:flex-row justify-between items-center`}> {/* Responsive flex direction */}
          {/* Left Side Panel */}
          <div className="grow   p-4 w-full md:w-auto md:h-[100vh]  "> {/* Adjusted width & height */}
            {/* Render the dynamic left side element from state/context */}
            {leftSideElement}
          </div>

          {/* Right Side Panel (Outlet area) */}
          <div className={`md:max-h-[90%]  shrink max-h-[50%] min-h-72 rounded-lg p-2 w-full md:w-auto min-w-sm pb-32 h-72 overflow-y-scroll ${background200Class} m-4 md:mr-4 md:my-4 shadow-lg`}> {/* Adjusted size/margins/shadow */}
            <Outlet /> {/* Components rendered here can use useDashContext() */}
          </div>
        </div>
      </div>

      {/* </KeyboardProvider> */}
    </DashContext.Provider>
  );
};

export default DashWrap;