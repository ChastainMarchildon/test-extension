import "isomorphic-fetch";
import { gql } from "apollo-boost";

export function RECURRING_CREATE(url) {
  return gql`
    mutation {
      appSubscriptionCreate(
          name: "Super Duper Plan"
          returnUrl: "${url}"
          test: true
          trialDays: 7
          lineItems: [
          {
            plan: {
              appUsagePricingDetails: {
                  cappedAmount: { amount: 10, currencyCode: USD }
                  terms: "$1 for 1000 emails"
              }
            }
          }
          {
            plan: {
              appRecurringPricingDetails: {
                  price: { amount: 10, currencyCode: USD }
              }
            }
          }
          ]
        ) {
            userErrors {
              field
              message
            }
            confirmationUrl
            appSubscription {
              id
            }
        }
    }`;
}

const GET_SUBSCRIPTION = gql`
  query{
    currentAppInstallation{
      activeSubscriptions{
        status
      }
    }
  }
`;

export const getSubscriptionUrl = async (ctx, shop, host) => {
  const { client } = ctx;
  var postredirct = `${process.env.HOST}/?shop=${shop}&host=${host}`
  const confirmationUrl = await client
    .mutate({
      mutation: RECURRING_CREATE(postredirct)
    })
    .then(response => response.data.appSubscriptionCreate.confirmationUrl);

  return ctx.redirect(confirmationUrl);
};

export const getAppSubscriptionStatus = async(ctx) =>{
  const {client} = ctx;
  const isActive =  await client
    .query({
      query:GET_SUBSCRIPTION
    })
    .then((response) =>{
      if(response.data.currentAppInstallation.activeSubscriptions.length){
        return (
          response.data.currentAppInstallation.activeSubscriptions[0].status === "ACTIVE"
        );
      } else return false;
    });
    return isActive;
}; 
