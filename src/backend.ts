import axios from 'axios';
import apiConfig from '../apiConfig.json';

export class BackEndFunctions {

    async client() {
        return await axios.get(apiConfig.endpoints.baseUrl + 'GetClientByClientId');
    }

    async accounts() {
        return await axios.get(apiConfig.endpoints.baseUrl + 'GetAccountsByClientId/active');
    }

    async lastTransactions(accountType: string) {
        return await axios.get(apiConfig.endpoints.baseUrl + 'GetLastTenTransactions/' + accountType);
    }

    async setClientId(token: string) {
        return await axios.put(apiConfig.endpoints.baseUrl + 'SetClientId/' + token);
    }

    async clearClientId() {
        return await axios.delete(apiConfig.endpoints.baseUrl + 'ClearClientId');
    }

    async getAllAccountStatusByClientId() {
        return await axios.get(apiConfig.endpoints.baseUrl + 'GetAllAccountStatusByClientId');
    }
}






