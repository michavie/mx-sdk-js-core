import { assert, expect } from "chai";
import { SmartContractTransactionIntentsFactory } from "./smartContractTransactionIntentsFactory";
import { Address } from "../address";
import { Code } from "../smartcontracts/code";
import { promises } from "fs";
import { AbiRegistry } from "../smartcontracts/typesystem/abiRegistry";
import { U32Value } from "../smartcontracts";
import { CONTRACT_DEPLOY_ADDRESS } from "../constants";

describe("test smart contract intents factory", function () {
    let smartContractIntentsFactory: SmartContractTransactionIntentsFactory;
    let abiSmartContractIntentsFactory: SmartContractTransactionIntentsFactory;
    let adderByteCode: Code;
    let abiRegistry: AbiRegistry;

    before(async function () {
        smartContractIntentsFactory = new SmartContractTransactionIntentsFactory({ chainID: "D", minGasLimit: 50000, gasLimitPerByte: 1500 });
        let adderBuffer = await promises.readFile("src/testdata/adder.wasm");
        adderByteCode = Code.fromBuffer(adderBuffer);

        let abiJson = await promises.readFile("src/testdata/adder.abi.json", { encoding: "utf8" });
        let abiObj = JSON.parse(abiJson);
        abiRegistry = AbiRegistry.create(abiObj);

        abiSmartContractIntentsFactory = new SmartContractTransactionIntentsFactory({ chainID: "D", minGasLimit: 50000, gasLimitPerByte: 1500 }, abiRegistry);
    });

    it("should throw error", async function () {
        const sender = Address.fromBech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");
        const gasLimit = 6000000;
        const args = [0];
        try {
            smartContractIntentsFactory.createTransactionIntentForDeploy(sender, adderByteCode.valueOf(), gasLimit, args);
        }
        catch (err) {
            expect(err.message).to.equal("Can't convert args to TypedValues");
        }
    });

    it("should build deploy intent", async function () {
        const sender = Address.fromBech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");
        const gasLimit = 6000000;
        const args = [new U32Value(0)];

        const deployIntent = smartContractIntentsFactory.createTransactionIntentForDeploy(sender, adderByteCode.valueOf(), gasLimit, args);
        const abiDeployIntent = abiSmartContractIntentsFactory.createTransactionIntentForDeploy(sender, adderByteCode.valueOf(), gasLimit, args);

        assert.equal(deployIntent.sender, "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");
        assert.equal(deployIntent.receiver, CONTRACT_DEPLOY_ADDRESS);
        assert.isDefined(deployIntent.data);

        if (deployIntent.data) {
            const expectedGasLimit = 6000000 + 50000 + 1500 * deployIntent.data.length;
            assert.equal(deployIntent.gasLimit.valueOf(), expectedGasLimit);
        }
        assert.equal(deployIntent.value, 0);

        assert.deepEqual(deployIntent, abiDeployIntent);
    });

    it("should build execute intent", async function () {
        const sender = Address.fromBech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");
        const contract = Address.fromBech32("erd1qqqqqqqqqqqqqpgqhy6nl6zq07rnzry8uyh6rtyq0uzgtk3e69fqgtz9l4");
        const func = "add";
        const gasLimit = 6000000;
        const args = [new U32Value(7)];

        const deployIntent = smartContractIntentsFactory.createTransactionIntentForExecute(sender, contract, func, gasLimit, args);
        const abiDeployIntent = abiSmartContractIntentsFactory.createTransactionIntentForExecute(sender, contract, func, gasLimit, args);

        assert.equal(deployIntent.sender, "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");
        assert.equal(deployIntent.receiver, "erd1qqqqqqqqqqqqqpgqhy6nl6zq07rnzry8uyh6rtyq0uzgtk3e69fqgtz9l4");

        assert.isDefined(deployIntent.data);
        let decoder = new TextDecoder();
        assert.equal(decoder.decode(deployIntent.data), "add@07");

        assert.equal(deployIntent.gasLimit.valueOf(), 6059000);
        assert.equal(deployIntent.value, 0);

        assert.deepEqual(deployIntent, abiDeployIntent);
    });

    it("should build upgrade intent", async function () {
        const sender = Address.fromBech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");
        const contract = Address.fromBech32("erd1qqqqqqqqqqqqqpgqhy6nl6zq07rnzry8uyh6rtyq0uzgtk3e69fqgtz9l4");
        const gasLimit = 6000000;
        const args = [new U32Value(0)];

        const deployIntent = smartContractIntentsFactory.createTransactionIntentForUpgrade(sender, contract, adderByteCode.valueOf(), gasLimit, args);
        const abiDeployIntent = abiSmartContractIntentsFactory.createTransactionIntentForUpgrade(sender, contract, adderByteCode.valueOf(), gasLimit, args);

        assert.equal(deployIntent.sender, "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");
        assert.equal(deployIntent.receiver, "erd1qqqqqqqqqqqqqpgqhy6nl6zq07rnzry8uyh6rtyq0uzgtk3e69fqgtz9l4");
        assert.isDefined(deployIntent.data);

        if (deployIntent.data) {
            let decoder = new TextDecoder();
            assert(decoder.decode(deployIntent.data).startsWith("upgradeContract@", 0));

            const expectedGasLimit = 6000000 + 50000 + 1500 * deployIntent.data.length;
            assert.equal(deployIntent.gasLimit.valueOf(), expectedGasLimit);
        }
        assert.equal(deployIntent.value, 0);

        assert.deepEqual(deployIntent, abiDeployIntent);
    });
});
