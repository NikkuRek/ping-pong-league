import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.lpp.iujo',
    appName: 'LPP',
    webDir: 'out',
    server: {
        url: 'https://lppiujo.vercel.app', // TODO: Update this to your Vercel URL
        cleartext: true,
    }
};

export default config;
