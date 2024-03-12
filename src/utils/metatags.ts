import { Metadata } from "next";

interface SocialMetaTagsSpecBase {
  title: string;
  images?: NonNullable<Metadata["openGraph"]>["images"];
  description?: string;
  // validate with: https://cards-dev.twitter.com/validator
  //   video?:
  //   audio?:
}

interface OGWebsiteExtraMetaTagsSpec {
  type: "website";
  twitterUseSmallImage?: boolean;
}

// listed as just an example, more items can be found here: https://ogp.me/
// other types includes media (Twitter also needs special handling), apps, profile, etc.
// check out Twitter cards: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/player-card
// handy tool to preview tags: https://www.opengraph.xyz/
interface OGArticleExtraMetaTagsSpec {
  type: "article";
  publishTime?: Date;
  modifiedTime?: Date;
  author?: string;
  section?: string;
  tag?: string;
  twitterUseSmallImage?: boolean;
}

export type SocialMetaTagsSpec = SocialMetaTagsSpecBase &
  (OGWebsiteExtraMetaTagsSpec | OGArticleExtraMetaTagsSpec);

export function generateSocialMetaTags({
  title,
  description,
  twitterUseSmallImage,
  images,
}: SocialMetaTagsSpec): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      type: "website",
      description,
      locale: "en_GB",
      siteName: "PromptBuddy",
      images,
    },
    twitter: {
      site: "@amataworld",
      card: twitterUseSmallImage ? "summary" : "summary_large_image",
    },
  };
}
