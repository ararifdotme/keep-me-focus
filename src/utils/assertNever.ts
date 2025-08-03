/**
 * TypeScript Exhaustiveness Checker Utility
 * 
 * A utility function for ensuring exhaustive checking in switch statements
 * and conditional logic. Helps catch missing cases at compile time.
 */

/**
 * Assert that a value should never be reached.
 * Used in switch statements to ensure all cases are handled.
 * 
 * @param value - The value that should never be reached
 * @throws Error with the unexpected value
 * @returns Never returns (throws an error)
 * 
 * @example
 * ```typescript
 * switch (actionType) {
 *   case ActionType.Allow:
 *     return handleAllow();
 *   case ActionType.Block:
 *     return handleBlock();
 *   default:
 *     return assertNever(actionType); // Ensures all cases are handled
 * }
 * ```
 */
export default function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}
