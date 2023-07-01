const makeMoneyString = (amount: number): string => {
  let result: string
  if (amount >= 0) {
    result = `+$${amount.toLocaleString()}`
  } else {
    result = `-$${Math.abs(amount).toLocaleString()}`
  }
  return result
}

export default makeMoneyString
