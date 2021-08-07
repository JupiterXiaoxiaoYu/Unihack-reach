import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
import { ask, yesno, done } from '@reach-sh/stdlib/ask.mjs';

(async () => {
  const stdlib = await loadStdlib();
  const timeoutK = stdlib.connector === 'ALGO' ? 1 : 3;
  const startingBalance = stdlib.parseCurrency(10);
  const fmt = (x) => stdlib.formatCurrency(x, 4);
  const getBalance = async (who) => fmt(await stdlib.balanceOf(who));


  ////
  const isFundraiser = await ask(
    'Are you Fundraiser?',
    yesno
  )

  var isDonors = true
  if (!isFundraiser) {
    isDonors = await ask('Are you Donors?', yesno)
  }

  const who = isFundraiser ? 'Fundraiser' : isDonors ? 'Donors' : 'Receiver';


  //登录
  let acc = null;
  const createAcc = await ask(
    `Would you like to create an account? (only possible on devnet)`,
    yesno
  );
  if (createAcc) {
    acc = await stdlib.newTestAccount(stdlib.parseCurrency(100));
  } else {
    const secret = await ask(
      `What is your account secret?`,
      (x => x)
    );
    acc = await stdlib.newAccountFromSecret(secret);
  }

  const interact = { ...stdlib.hasRandom };

  let ctc = null;

  if (who == 'Receiver') {
    ctc = acc.deploy(backend);
    const info = await ctc.getInfo();
    interact.getInfo = () => {
      return info;
    }
    console.log(`The contract is deployed as = ${JSON.stringify(info)}`);
  } else {
    const info = await ask(
      `Please paste the contract information:`,
      JSON.parse
    );
    ctc = acc.attach(backend, info);
    interact.getInfo = () => {
      return info;
    }
  }


  interact.showAddress = async () => {
    console.log('your address and information has been recorded, please wait for third party fundraiser to raise money for you')
    return acc;


  }

  interact.showDifficulty = async () => {
    const difficulty = await ask(
      "what's difficulty are you undergoing?",
    )
    return difficulty
  }


  // if(who=='Fundraiser'){
  interact.getParams = async () => ({

    object_amount: stdlib.parseCurrency(
      await ask(`Please enter the objective amount of donation:`,)
    ),
    duration: parseInt(await ask(`Please enter the duration:`,)
    ),
  })
  // }



  // if(who=='Donors'){

  interact.getPayment = async () => {
    const payment = await ask('Please enter the score of love according to the time',
    )
    return parseInt(payment)
  }

  interact.getAmount = async (Amount, object_amount, intend_donate) => {
    if (Amount + intend_donate <= object_amount) {
      const Donate = stdlib.add(intend_donate, stdlib.parseCurrency(1));
      console.log(`${who} tries to Donate ${fmt(intend_donate)} (based on all current donations: ${fmt(Amount)})`);
      return ['Some', Donate];
    } else {
      return ['None', null];
    }


  }
  // }


  if (who == 'Receiver') {
    interact.showBalance = async () => {
      console.log(`your balance is ${balanceOf(acc)}`)
    }
  }

  if (isFundraiser) {
    const part = backend.Fundraiser
    await part(ctc, interact);
  }
  if (!isFundraiser && isDonors) {
    const part = backend.Donors
    await part(ctc, interact);
  }
  if (!isFundraiser && !isDonors) {
    const part = backend.Receiver
    await part(ctc, interact);
  }




  done()
})();