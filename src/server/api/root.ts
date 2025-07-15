import { bookRouter } from "~/server/api/routers/book";
import { authorRouter } from "~/server/api/routers/author";
import { seriesRouter } from "~/server/api/routers/series";
import { authRouter } from "~/server/api/routers/auth";
import { categoryRouter } from "~/server/api/routers/category";
import { userManagementRouter } from "~/server/api/routers/userManagement";
import { userProfileRouter } from "~/server/api/routers/userProfile";
import { statisticsRouter } from "~/server/api/routers/statistics";
import { quoteRouter } from "~/server/api/routers/quote";
import { bookMetadataRouter } from "~/server/api/routers/bookMetadata";
import { movieMetadataRouter } from "~/server/api/routers/movieMetadata";
import { movieRouter } from "~/server/api/routers/movie";
import { mediaReleaseRouter } from "~/server/api/routers/mediaRelease";

import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { embeddableRouter } from "~/server/api/routers/embeddable";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  book: bookRouter,
  author: authorRouter,
  series: seriesRouter,
  auth: authRouter,
  category: categoryRouter,
  userManagement: userManagementRouter,
  userProfile: userProfileRouter,
  statistics: statisticsRouter,
  embeddable: embeddableRouter,
  quote: quoteRouter,
  bookMetadata: bookMetadataRouter,
  movieMetadata: movieMetadataRouter,
  movie: movieRouter,
  mediaRelease: mediaReleaseRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
