import {acceptHMRUpdate, defineStore} from "pinia";

export const useGrpcStore = defineStore("grpc", () => {
    const whitelistUrl = ref("localhost:8090");
    const configUrl = ref("localhost:9090");

    const setConfigUrl = (url: string) => {
        console.log("update config url: ",url)
        configUrl.value = url
    }
    const setWhitelistUrl = (url: string) => {
        whitelistUrl.value = url
    }

    return {
        configUrl,
        whitelistUrl,
        setConfigUrl,
        setWhitelistUrl
    };
});

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useGrpcStore, import.meta.hot));
