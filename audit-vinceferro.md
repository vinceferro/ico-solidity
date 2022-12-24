Author: bskyn

General comments: good usage of dev comments for each functions! General code was easy to follow and understand.

# No high vulnerabilities found

# Low severity vulnerabilities

**[L-1]** line 124 `_releasePreOpenPhaseTokens` consider using a pull pattern vs push on releasing tokens. We are looping over an unbounded array whose size can potentially grow very large (e.g. seed/general investors making very small contributions). Responsibility is on the contract for paying the gas consumed by the transaction which might exceed the block gas limits and makes the transactions fail. Could outsource the responsibility to the investor to claim their tokens.

# Quality of Improvements

**[Q-1]** line 25 inside the Phase struct, instead of using a string here consider using bytes8 to save on gas as the phase string values are fixed. Similar comment on event PhaseChange.

**[Q-2]** good idea to check for re-entrancy but consider writing your own modifer as specs didn't explicitly state to use an external library.

Other nits:

- Wasn't able to run your test suite as got error from "src/types/\*" missing from files
- nit: SpaceCoinICO.behavior.ts line 28, test is passing but might not be for the logic you're checking. It's asserting that the target is a truthy value which is true as its a promise
- nit: SpaceCoinICO.behavior.ts line 102, believe this is testing only up to 25000 ether? (10 \* 1500) + (10 \* 1000)
