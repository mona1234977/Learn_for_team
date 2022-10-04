const Stripe = require('stripe');
const stripe = Stripe('sk_test_51JDSCaICa4fFFXRVFXTz8l8383xMrh13Frl0datQWy3RlgvbZv8KsiuWmlBVAYrk406XBTEMpMx30Ewq6hSBkkSX00f3hTrNTn');
//const stripe = Stripe('sk_test_51JY1uYSIQSXLxljRHmU03PuSpbFtFwVIgmNv7VesOYwzBcxMiS1iGL7fQTaBikfac9VC39AlEodbQY1JbgA2j60g00fxrmdGPw');





exports.createToken = async function () {
	const token = await stripe.tokens.create({
		card: {
			number: '4242424242424242',
			exp_month: 9,
			exp_year: 2022,
			cvc: '314',
		},
	});
	return token;
};

exports.makePayment = async function (token) {
	const charges = await stripe.charges.create({
		amount:100, 
		currency: "usd",
		source: token.id,
	});
	return charges;
};

exports.createAccount = async function () {
	const account = await stripe.accounts.create({
		type: 'express',
	  });
	return account;
};

exports.createCutomer = async function () {
	const customer = await stripe.customers.create({
		description: 'My First Test Customer (created for API docs)',
	});
	return customer;
};


exports.createAccountUser = async function (bankTkn) {
	const account = await stripe.accounts.create({
		type: 'express',
	  });
	// const account = await stripe.accounts.create({
	// 	type: 'custom',
	// 	country: 'US',
	// 	email: 'tamisi1102@gmail.com',
	// 	capabilities: {
	// 	  card_payments: {requested: true},
	// 	  transfers: {requested: true},
	// 	},
	//   });

	// const accounts = await stripe.accounts.list({
	// 	limit: 3,
	//   });
	  console.log('bankTkn.id-----------',account)
};


exports.createCharge = async function (token,cust) {
	const charge = await stripe.charges.create({
		amount: 20,
		currency: 'usd',
		source: token.id,
		description: 'My First Test Charge (created for API docs)',
		destination: cust.id
	});
	return charge;
};

exports.payOut = async function (bank) {
	const payout = await stripe.payouts.create({
		amount: 1000,
		currency: 'JYP',
		method: 'instant',
	  }, {
		stripeAccount: bank.id,
	  });
	// const payout = await stripe.payouts.create({
	// 	amount: 10,
	// 	currency: 'inr',
	// 	method: 'instant',
	// 	destination: bank.id,
	//   });
	return payout;
};

exports.bankToken = async function (bank) {
	const account = await stripe.accounts.create({
		country: 'JP',
  type: 'express',
  capabilities: {
    card_payments: {
      requested: true,
    },
    transfers: {
      requested: true,
    },
  },
	  });
	 // console.log(account);
	const banktoken = await stripe.tokens.create({
		bank_account: {
			country: 'JP',
			currency: 'JYP',
			account_holder_name: 'Jenny Rosen',
			account_holder_type: 'individual',
			routing_number: 'HDFC0000261',
			account_number: '000123456789',
		  },
	});
	console.log('account id-------------',account.id);
	console.log('external_account-------------',banktoken.id);
	const bankAccount = await stripe.accounts.createExternalAccount(
		account.id,
		{
		  external_account: banktoken.id,
		}
	  );
	  console.log('bankAccount-------------',bankAccount);
	//   const bankAccountRet = await stripe.accounts.retrieveExternalAccount(
	// 	account.id,
	// 	bankAccount.id
	//   );
	const accountBankAccounts = await stripe.accounts.listExternalAccounts(
		account.id,
		{object: 'bank_account', limit: 3}
	  );
	  console.log(accountBankAccounts);
 return account.id;
};

exports.transfer= async function (accid) {
	const transfer = await stripe.transfers.create({
		amount: 10,
		currency: 'JYP',
		destination: accid,

	  });
	  console.log(transfer);
 // return bankAccount;
};
exports.createSouce = async function (cust,btok) {
	const bankAccount = await stripe.customers.createSource(
		cust.id,
		{source: btok.id}
	  );
	
  return bankAccount;
};