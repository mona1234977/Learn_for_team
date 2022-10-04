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
	console.log(token,'token in makepayment function ')
	const charges = await stripe.charges.create({
		amount:150, 
		currency: "JPY",
		source: token.id,
	});
	return charges;
};

//original
// exports.createAccount = async function () {
// 	const account = await stripe.accounts.create({
// 		type: 'express'
// 	  });
// 	return account;
// };

//mine 
exports.createAccount = async function () {
	const account = await stripe.accounts.create({
		type: 'express'
	  });
	return account;
};

exports.createCutomer = async function (token) {
	const customer = await stripe.customers.create({
		source: token.id,
		description: 'My First Test Customer (created for API docs)',
	});
	// const customer =  await stripe.customers.create({
	// 	source: token.id
	//   }).then(function (customer) {
	// 	await stripe.charges.create({
	// 		 amount: 1000,
	// 		 currency: 'inr',
	// 		 customer: customer.id 
	// 	  });
	//   });
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


exports.createCharge = async function (token,cust,destid) {
	// const charge = await stripe.charges.create({
	// 	amount: 20,
	// 	currency: 'inr',
	// 	source: token.id,
	// 	description: 'My First Test Charge (created for API docs)',
	// 	customer: cust.id
	// });
	console.log(token.card.id)
	const charge = await stripe.charges.create({
		customer: cust.id,
		source: token.card.id,
		amount: 1000,
		currency: 'JPY',
		// description: process.env.APP_NAME,
		// statement_descriptor: process.env.APP_NAME,
		//application_fee: 10,
		destination: destid.id
	});
	return charge;
};

exports.payOut = async function (bank,chargeId) {

	// const charge = await stripe.charges.create({
	// 	customer: data.customer,
	// 	source: data.cardId,
	// 	amount: amount,
	// 	currency: user.currency,
	// 	application_fee: platformFee,
	// 	destination: bank.id
	//   });

	// const payout = await stripe.payouts.create({
	// 	amount: 1000,
	// 	currency: 'jpy',
	// 	method: 'instant',
	//   }, {
	// 	stripeAccount: bank.id,
	//   });
	console.log(bank);
	const payout =  await stripe.transfers.create({
		amount: 1000,
		currency: 'JPY',
		source_transaction: chargeId.id,
		destination: bank
	 });
	// const payout = await stripe.payouts.create({
	// 	amount: 1000,
	// 	currency: 'inr',
	// 	destination: bank.id,
	// 	method: 'instant',
	//   });
	return payout;
};

exports.accLink = async function () {
	const accountLinks = await stripe.accountLinks.create({
		account: 'acct_1032D82eZvKYlo2C',
		refresh_url: 'https://example.com/reauth',
		return_url: 'https://example.com/return',
		type: 'account_onboarding',
	});
  return accountLinks;
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
			currency: 'JPY',
			account_holder_name: 'Jenny Rosen',
			account_holder_type: 'individual',
			routing_number: '1100000',
			account_number: '0001234',
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
	 // console.log('bankAccount-------------',bankAccount);
	//   const bankAccountRet = await stripe.accounts.retrieveExternalAccount(
	// 	account.id,
	// 	bankAccount.id
	//   );
	const accountBankAccounts = await stripe.accounts.listExternalAccounts(
		account.id,
		{object: 'bank_account', limit: 3}
	  );
	 /// console.log(accountBankAccounts);
 return account.id;
};

exports.transfer= async function (accid) {
	const transfer = await stripe.transfers.create({
		amount: 10,
		currency: 'JPY',
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

exports.createAccount_1 = async function () {
	// const account = await stripe.accounts.create({
	// 	type: 'express',
	// 	country: 'JP',
	// 	email: 'tamisi1102@gmail.com',
	// 	capabilities: {
	// 	  card_payments: {requested: true},
	// 	  transfers: {requested: true},
	// 	},
	//   });
	const banktoken = await stripe.tokens.create({
		bank_account: {
			country: 'JP',
			currency: 'JPY',
			account_holder_name: 'Jenny Rosen',
			account_holder_type: 'individual',
			routing_number: '1100000',
			account_number: '0001234',
		  },
	});
	console.log('account id-------------',banktoken);
	//   const banktoken = await stripe.tokens.create({
	// 	bank_account: {
	// 		country: 'JP',
	// 		currency: 'JPY',
	// 		account_holder_name: 'Jenny Rosen',
	// 		account_holder_type: 'individual',
	// 		routing_number: '1100000',
	// 		account_number: '0001234',
	// 	  },
	// });
	// console.log('account id-------------',account.id);
	// console.log('external_account-------------',banktoken.id);
	// const bankAccount = await stripe.accounts.createExternalAccount(
	// 	account.id,
	// 	{
	// 	  external_account: banktoken.id,
	// 	}
	//   );
	// const accounts = await stripe.accounts.list({
	// 	limit: 3,
	//   });
	// console.log('bankAccount----------',accounts)
	 
	  return banktoken;
};

exports.payouts_1 = async function (bankid) {
	const payout = await stripe.payouts.create({
		amount: 100,
		currency: 'JPY',
	});
	// const payout = await stripe.payouts.create({
	// 	amount: 1100,
	// 	currency: 'jpy',
	//   });
	const payout1 = await stripe.payouts.retrieve(
		payout.id
	  );
	return payout1;
};