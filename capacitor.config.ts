import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.lpp.app',
    appName: 'LPP',
    webDir: 'out',
    server: {
        url: 'https://lpp-iujo.vercel.app', // TODO: Update this to your Vercel URL
        cleartext: true,
    }
};

export default config;
