https://github.com/ShipyardDAO/student.vinceferro/tree/3dafcc683b4852497afc0eb9a92fa881e1893901/ico

The following is a micro audit by Gab

# Design Exercise

Nice implementation! Cool to separate the logic as well.

# General Comments

Nice work putting the taxing logic on `_transfer`! This covers both `transfer` and `transferFrom`

Also, I really like your implementation for the logic of multiple phases, very readable, as well as the commented code, great work on keeping it clean!

# Issues

**[M-1]** If the investors array is too big, no one gets their tokens

`_releasePreOpenPhaseTokens()` loops over an array of unknown length, if this array gets too big, the call might run out of gas and fail at any point, which would revert all state changes and block the entirety of the investors from getting their tokens

Note that if this same pattern was used but sending ETH instead of tokens, it would open up for a DoS attack, since if the function transfers to a malicious contract that reverts on its fallback, it blocks the transfer for everyone, even if the array is small

Keep in mind the pull-over-push pattern: 

https://fravoll.github.io/solidity-patterns/pull_over_push.html

https://solidity-by-example.org/hacks/denial-of-service/

**[L-1]** It might better to be specific on which phase the owner wants to advance to, since they could call it twice by accident and skip a phase

# Score

| Reason | Score |
|-|-|
| Late                       | - |
| Unfinished features        | - |
| Extra features             | - |
| Vulnerability              | 3 |
| Unanswered design exercise | - |
| Insufficient tests         | - |
| Technical mistake          | - |

Total: 3

Good job!
