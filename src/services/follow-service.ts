import { BadRequestError } from "../errors";
import FollowDb from "../db/models/follow";
import { Follow, FollowUnfollowParams, FollowingFollowersParams, FollowsResponse } from "./models/follow-model";
const { min } = Math;

export default class FollowService {
   public async followUser(params: FollowUnfollowParams): Promise<Follow> {
      const followerId = params.followerId;
      const followingId = params.followingId;
      if (followerId === followingId) throw new BadRequestError("You can't follow yourself");

      const isFollowing = await FollowDb.findOne({
         followerId: followerId,
         followingId: followingId,
      });
      if (isFollowing) throw new BadRequestError("You're already following this user");

      const follow = await FollowDb.create({
         followerId: followerId,
         followingId: followingId,
      });

      return follow.toJson();
   }

   public async unfollowUser(params: FollowUnfollowParams): Promise<Follow> {
      const deleted = await FollowDb.findOneAndDelete(params);
      if (!deleted) throw new BadRequestError("You aren't following this user")

      return deleted.toJson();
   }

   public async getFollowing(params: FollowingFollowersParams): Promise<FollowsResponse> {
      const request = { followerId: params.userId };
      const page = params.page ?? 0;
      const pageSize = min(params.pageSize ?? 10, 100);
      const skipped = page * pageSize;
      const results = await FollowDb.find(request, null, {
         skip: skipped,
         limit: pageSize,
         sort: { createdAt: -1 }
      });
      const totalCount = await FollowDb.countDocuments(request);

      await Promise.all(
         results.map((f) => f.populateFollowingField())
      );

      return {
         totalCount: totalCount,
         count: results.length,
         follows: results.map((f) => f.toJson()),
      };
   }
}
