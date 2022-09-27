const { execSync } = require('child_process');
const ProofPath = '../proof';
const PrepareProof = '../proof/prepare_proof';
const CircuitJs = PrepareProof+'multiple_tokens_transfer_and_withdraw_js';
function execute(StringName)
{
    execSync(StringName,{stdio:'inherit',stdin:'inherit'})
}


console.log('Compiling circuit....')
execute('circom ../circuits/multiple_tokens_transfer_and_withdraw.circom --r1cs --wasm --sym --output ../proof/prepare_proof');

console.log('Caculate witness....')
execute('node ../proof/prepare_proof/multiple_tokens_transfer_and_withdraw_js/generate_witness.js ../proof/prepare_proof/multiple_tokens_transfer_and_withdraw_js/multiple_tokens_transfer_and_withdraw.wasm ../input/input.json ../proof/witness.wtns');

console.log('Creating zkey file...')
execute('snarkjs groth16 setup ../proof/prepare_proof/multiple_tokens_transfer_and_withdraw.r1cs ../proof/prepare_proof/powersOfTau28_hez_final_18.ptau ../proof/multiple_tokens_transfer_and_withdraw_0000.zkey')

console.log('Creating final zkey file...')
execute('snarkjs zkey contribute ../proof/multiple_tokens_transfer_and_withdraw_0000.zkey ../proof/multiple_tokens_transfer_and_withdraw_final.zkey --name="1st Contributor Name" -v')

console.log('Exporting the verification key:')
execute('snarkjs zkey export verificationkey ../proof/multiple_tokens_transfer_and_withdraw_final.zkey ../proof/verification_key.json')

console.log('Generating a Proof...')
execute('snarkjs groth16 prove ../proof/multiple_tokens_transfer_and_withdraw_final.zkey ../proof/witness.wtns ../proof/proof.json ../proof/public.json')

console.log('Verifying a Proof...')
execute('snarkjs groth16 verify ../proof/verification_key.json ../proof/public.json ../proof/proof.json')

console.log('Generating a Smart Contract ...')
execute('snarkjs zkey export solidityverifier ../proof/multiple_tokens_transfer_and_withdraw_final.zkey ../contracts/verifier.sol')
