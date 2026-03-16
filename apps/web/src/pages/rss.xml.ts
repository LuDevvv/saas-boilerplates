import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context: any) {
  const posts = await getCollection("blog");

  return rss({
    title: "L.A. Labs Blog",
    description:
      "Edge-native engineering and high-performance SaaS development.",
    site: context.site,
    items: posts.map((post) => {
      const [lang, ...slugParts] = post.id.split("/");
      const slug = slugParts.join("/");
      const link = lang === "en" ? `/blog/${slug}` : `/${lang}/blog/${slug}`;

      return {
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: link,
      };
    }),
  });
}
