export const vulnerabilityPatterns = [
  {
    id: "reentrancy",
    title: "Reentrancy Attack",
    severity: "High",
    description: "Reentrancy occurs when an external contract is called before the calling contract updates its own state. The external contract can call back into the original function before the first invocation completes, potentially draining funds. This typically happens when a contract sends Ether or calls an external function before updating balances or state variables. Classic example: a withdraw function that sends funds via call() before setting the user's balance to zero, allowing the attacker's fallback function to call withdraw again before the balance updates.",
    detectionHints: "Look for external calls (call, send, transfer, or calls to other contract functions) that occur BEFORE state variables are updated. Pay special attention to withdrawal/transfer functions.",
    fix: "Use the Checks-Effects-Interactions pattern: update state variables BEFORE making external calls. Consider using a reentrancy guard modifier (like OpenZeppelin's ReentrancyGuard) for extra safety."
  },
  {
    id: "integer-overflow-underflow",
    title: "Integer Overflow/Underflow",
    severity: "Medium",
    description: "Integer overflow happens when an arithmetic operation exceeds the maximum value a variable type can hold, causing it to wrap around to a very small number. Underflow is the reverse, when subtraction goes below zero and wraps to a very large number. Before Solidity 0.8.0, this was a major attack vector since unsigned integers would silently wrap instead of throwing an error.",
    detectionHints: "Check the Solidity pragma version. If it's below 0.8.0 and the contract doesn't use SafeMath library, any addition, subtraction, or multiplication on uint/int types is at risk.",
    fix: "Upgrade to Solidity 0.8.0 or later, which has built-in overflow/underflow checks that revert automatically. If stuck on an older version, use OpenZeppelin's SafeMath library for all arithmetic operations."
  },
  {
    id: "unchecked-external-calls",
    title: "Unchecked External Call Return Values",
    severity: "Medium",
    description: "Low-level calls like call(), send(), and delegatecall() return a boolean indicating success or failure instead of automatically reverting on failure. If the contract doesn't check this returned boolean, it may continue executing as if the call succeeded even when it failed, leading to inconsistent state or lost funds.",
    detectionHints: "Search for .call(, .send(, or .delegatecall( and verify the return value is checked with a require() or if statement immediately after.",
    fix: "Always check the return value of low-level calls: 'require(success, \"Call failed\");' immediately after the call. Prefer using transfer() for simple Ether transfers, since it auto-reverts on failure, or explicitly check call()'s return value."
  },
  {
    id: "access-control",
    title: "Missing or Improper Access Control",
    severity: "High",
    description: "Functions that perform sensitive actions (withdrawing funds, changing ownership, minting tokens, pausing the contract) must restrict who can call them. Missing access control means any address can call these functions, potentially draining funds or taking control of the contract. This often happens when a modifier like onlyOwner is forgotten on a sensitive function.",
    detectionHints: "Identify functions that change critical state (withdraw, mint, setOwner, pause, upgrade) and check whether they have an access control modifier (onlyOwner, onlyAdmin, role-based checks) applied.",
    fix: "Apply appropriate access control modifiers to every sensitive function. Use OpenZeppelin's Ownable or AccessControl contracts rather than writing custom permission logic from scratch."
  },
  {
    id: "tx-origin-auth",
    title: "Use of tx.origin for Authorization",
    severity: "Medium",
    description: "Using tx.origin to check the caller's identity is unsafe because it returns the original sender of the entire transaction chain, not the immediate caller. If a user interacts with a malicious contract that internally calls your contract, tx.origin would incorrectly show the original user's address instead of the malicious contract, potentially bypassing authorization checks.",
    detectionHints: "Search for 'tx.origin' anywhere in the contract, especially in conditions like 'require(tx.origin == owner)'.",
    fix: "Always use msg.sender instead of tx.origin for authorization checks. msg.sender correctly identifies the immediate caller of the function."
  },
  {
    id: "unprotected-selfdestruct",
    title: "Unprotected selfdestruct",
    severity: "High",
    description: "The selfdestruct (or suicide) function permanently destroys the contract and sends its remaining Ether to a specified address. If this function lacks proper access control, any user can destroy the contract and steal its funds.",
    detectionHints: "Search for 'selfdestruct' or 'suicide' and confirm it's protected by an access control check restricting it to the owner or an authorized role.",
    fix: "Restrict selfdestruct calls with an onlyOwner modifier or equivalent access control. Consider whether the contract needs this functionality at all, since it's a common target for exploits."
  },
  {
    id: "timestamp-dependence",
    title: "Block Timestamp Dependence",
    severity: "Low",
    description: "Relying on block.timestamp for critical logic (especially randomness or precise timing) is risky because miners/validators have some influence over the timestamp within a small window, and it shouldn't be treated as a precise or unpredictable value.",
    detectionHints: "Search for 'block.timestamp' or the older 'now' keyword, especially if used for randomness generation or as a critical condition with tight tolerances.",
    fix: "Avoid using block.timestamp for randomness. For time-based logic, allow for reasonable tolerance windows rather than exact comparisons, since timestamps can vary slightly."
  },
  {
    id: "gas-limit-dos",
    title: "Denial of Service via Gas Limit (Unbounded Loops)",
    severity: "Medium",
    description: "Loops that iterate over dynamically-sized arrays (like a list of all users) can run out of gas as the array grows, permanently blocking the function from executing. This becomes a denial-of-service vulnerability since the contract becomes unusable once the array exceeds what fits in a block's gas limit.",
    detectionHints: "Look for 'for' loops that iterate over storage arrays whose length can grow unbounded over time (e.g., looping through all registered users to pay them all in one transaction).",
    fix: "Avoid unbounded loops over growing data structures. Use pull-based patterns (let users withdraw individually) instead of push-based patterns (contract pays everyone in one loop), or implement pagination."
  },
];

export function formatPatternsForEmbedding() {
  return vulnerabilityPatterns.map((pattern) => ({
    text: `${pattern.title} (Severity: ${pattern.severity})\n\n${pattern.description}\n\nDetection hints: ${pattern.detectionHints}\n\nRecommended fix: ${pattern.fix}`,
    metadata: { id: pattern.id, title: pattern.title, severity: pattern.severity },
  }));
}
