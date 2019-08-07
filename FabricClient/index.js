var fabricClient = require('./.Config/FabricClient');
var fs = require('fs');
var path = require('path');
const configPath = path.join(process.cwd(), './channel1_HACK2019_profile.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
class CemexNetwork {

    constructor(userName) {
        this.currentUser;
        this.issuer;
        this.userName = userName;
        this.connection = fabricClient;
    };

    init() {
        var isAdmin = false;
        fabricClient.loadFromConfig(config);
        if (this.userName == "admin") {
            isAdmin = true;
        }
        return this.connection.initCredentialStores().then(() => {
            return this.connection.getUserContext(this.userName, true)
        }).then((user) => {
            this.issuer = user;
            if (isAdmin) {
                return user;
            }
            for (tran in transactions){
                this.crearTransaction(tran)
            }
            return this.ping();
        }).then((user) => {
            this.currentUser = user;
            return user;
        }).catch(e => {
            console.log(e);
        })
        
    };

    crearTransaction(data) {
        var tx_id = this.connection.newTransactionID();
        var requestData = {
            fcn: 'createProduct',
            args: [data.encargado, data.provedor, data.product, data.quantity],
            txId: tx_id
        };
        var request = FabricModel.requestBuild(requestData);
        return this.connection.submitTransaction(request);
    };

    updateTransaction(data) {
        var tx_id = this.connection.newTransactionID();
        var requestData = {
            fcn: 'updateItem',
            args: [data.itemId, data.value],
            txId: tx_id
        };
        var request = FabricModel.requestBuild(requestData);
        return this.connection.submitTransaction(request);
    }
}

let currentUser = new CemexNetwork('admin');
currentUser.init();

