# Space Coin ICO

The smart contract aims to raise 30,000 Ether by performing an ICO. The ICO should only be available to whitelisted private investors starting in Phase Seed with a maximum total private contribution limit of 15,000 Ether and an individual contribution limit of 1,500 Ether. The ICO should become available to the general public during Phase General, with a total contribution limit equal to 30,000 Ether, inclusive of funds raised from the private phase. During this phase, the individual contribution limit should be 1,000 Ether, until Phase Open, at which point the individual contribution limit should be removed. At that point, the ICO contract should immediately release ERC20-compatible tokens for all contributors at an exchange rate of 5 tokens to 1 Ether. The owner of the contract should have the ability to pause and resume fundraising at any time, as well as move a phase forwards (but not backwards) at will.

Breakdown of the ICO contract:
- whiteliste private investors
- adjust total contribution limit
- adjust individual contribution limit
- advance phase
- release tokens to private investor on phase open at exchange rate of 5 tokens to 1 Ether
- pause and resume fundraising

Breakdown of the ERC20 token:
- 500,000 max total supply
- A 2% tax on every transfer that gets put into a treasury account
- enable/disable the 2% transfer tax

# Design Exercises

The base requirements give contributors their SPC tokens immediately. How would you design your contract to vest the awarded tokens instead, i.e. award tokens to users over time, linearly?

I think modeling a Vesting contract would be a good way to do this, so rather than releasing tokens the ICO contract would be able to create instances of Vesting contracts on which the investor can call the vesting methods.

The vesting contracts would contain info such as:
- start of the vesting period
- end of the vesting period
- amount of tokens to be vested
- beneficiary of the vesting period
- track of the tokens vested
The most important method on the contract would be:
- withdraw that would allow the beneficiary to withdraw the vested tokens

The ICO contract would transfer the allocated tokens to the Vesting contract so the vesting process can continue without further interaction with the ICO contract.

# Deployment Report

Network: Rinkeby

SpaceCoinToken: 0x85D4dD1bFD3d279Ef7233Ca5904ef3FC63788661
Deployment Tx: https://rinkeby.etherscan.io/tx/0x405f278db420349235c9c6e7e2fb5b35c143a68a6c5bf14591ab74fb08b9b909

SpaceCoinICO: 0x2836CE10c953E4Ad5f77FEe956db1531E2423A77
Deployment Tx: https://rinkeby.etherscan.io/tx/0xc40b89b43de189748193e596730672ab282299461428f7bf2f64c6cb41ab9391

SpaceCoinICO Fund: https://rinkeby.etherscan.io/tx/0xbf3dd192eee2b11f17a467a8d6a3fd38051ce01338b97ad7d6197de69b3f5d9a