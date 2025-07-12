import { useDispatch, useSelector } from "react-redux"; // Import useDispatch and useSelector from react-redux, and type helpers to make them strongly typed
// It helps send actions safely to the Redux store with TypeScript support
export const useAppDispatch = useDispatch;
// It helps read state safely from the Redux store with TypeScript support
export const useAppSelector = useSelector;
