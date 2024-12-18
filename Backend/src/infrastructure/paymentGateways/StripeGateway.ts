import Stripe from 'stripe';
import envConfig from "../../config/env";
import { IPaymentGateway } from './IPaymentGateway';


export class StripePaymentGateway implements IPaymentGateway {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(envConfig.STRIPE_SECRET_KEY as string);
    }

    async verifyPayment(clientSecret: string): Promise<boolean> {
        try {
            // const { paymentIntent } = await this.stripe.retrievePaymentIntent(clientSecret);
            // if (paymentIntent && paymentIntent.status === 'succeeded') {
            //     return true;
            // }
        } catch (error) {
            console.error('Error verifying payment:', error);
        }
        return false;
    }

    // ... rest of your code remains the same
}
