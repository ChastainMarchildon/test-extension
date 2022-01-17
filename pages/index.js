import { Heading, Page, Layout, Card, List, MediaCard } from "@shopify/polaris";

const Index = () => (
  <Page>
    <Layout>
      <Layout.Section>
        <Card title="Welcome to #APPNAME" sectioned>
          <MediaCard
                  title="Getting Started"
                  description="In order to use #APPNAME, you'll need to set up a coupon that allows the customer to claim the free gift."
                >
                  <img
                    alt=""
                    width="100%"
                    height="100%"
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                    src="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
                  />
                </MediaCard>
          </Card>
          <Card title="Setup Steps in Shopify Admin" sectioned>
            <List type="number">
              <List.Item>In order to make this a seamless process for the customer, we want to make an automatic discount. Open your Shopify admin in a new window and navigate to the discounts section.</List.Item>
              <List.Item>Click on "Create Discount" and select Automatic Discount.</List.Item>
              <List.Item>In this menu we get a bunch of options to customize. We want to select the discount type to "Buy X Get Y"</List.Item>
              <List.Item>Under the "Customer Buys" section, input the dollar amount that you want to be the minimum threshold for the gift, Make a note of this number as we will need to set this one more time. </List.Item>
              <List.Item>Next, under "Customer Gets" Select the product that you want to offer as a gift, again - make a note of the product as we will need to set this one more time.</List.Item>
              <List.Item>The rest of the settings can be customized to suit your needs, once you are done hit save and navigate to the Shopify Dashboard.</List.Item>
            </List>
        </Card>

        <Card title="Setup Steps for Customizing the app" sectioned>
          <List type="number">
            <List.Item>From the Shopify dashboard, navigate to your theme customization page.</List.Item>
            <List.Item>Click on "Theme Settings" in the bottom left and then on "App Embeds" then, find #APPNAME</List.Item>
            <List.Item>The 2 important parts here are selecting the <bold>exact same item</bold> that you did when setting up the discount page, as well as the same price.</List.Item>
            <List.Item>The rest of the settings here are up to you to adjust to fit your needs!</List.Item>
          </List>
        </Card>
      </Layout.Section>
    </Layout>
  </Page>
);

export default Index;
