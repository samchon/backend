import * as orm from "typeorm";
import safe from "safe-typeorm";

import { BbsComment } from "../articles/BbsComment";
import { BbsFreeArticle } from "../articles/BbsFreeArticle";
import { BbsQuestionArticle } from "../articles/BbsQuestionArticle";
import { BbsReviewArticle } from "../articles/BbsReviewArticle";
import { Citizen } from "../../members/Citizen";
import { Member } from "../../members/Member";

@orm.Entity()
export class BbsCustomer<Ensure extends boolean = false>
    extends safe.Model
{
    /* -----------------------------------------------------------
        COLUMNS
    ----------------------------------------------------------- */
    @orm.PrimaryGeneratedColumn("uuid")
    public readonly id!: string;

    @safe.Belongs.ManyToOne(() => Citizen,
        citizen => citizen.customers,
        "uuid",
        "citizen_id",
        { index: true, nullable: true }
    )
    public readonly citizen!: safe.Belongs.ManyToOne<
            Citizen, 
            "uuid", 
            Ensure extends true 
                ? {} 
                : { nullable: true }>;

    @safe.Belongs.ManyToOne(() => Member,
        member => member.customers,
        "uuid",
        "member_id",
        { index: true, nullable: true }
    )
    public readonly member!: safe.Belongs.ManyToOne<Member, "uuid", { nullable: true }>;

    @orm.Column("varchar")
    public readonly ip!: string;

    @orm.Column("varchar", { length: 1000 })
    public readonly href!: string;

    @orm.Column("varchar", { length: 1000 })
    public readonly referrer!: string;

    @orm.CreateDateColumn()
    public readonly created_at!: Date;

    /* -----------------------------------------------------------
        HAS
    ----------------------------------------------------------- */
    @safe.Has.OneToOne
    (
        () => BbsFreeArticle,
        sub => sub.base
    )
    public readonly freeArticles!: safe.Has.OneToMany<BbsFreeArticle>;

    @safe.Has.OneToOne
    (
        () => BbsQuestionArticle,
        sub => sub.base
    )
    public readonly questionArticles!: safe.Has.OneToMany<BbsQuestionArticle>;

    @safe.Has.OneToOne
    (
        () => BbsReviewArticle,
        sub => sub.base
    )
    public readonly reviewArticles!: safe.Has.OneToMany<BbsReviewArticle>;

    @safe.Has.OneToMany
    (
        () => BbsComment,
        comment => comment.customer,
        (x, y) => x.created_at.getTime() < y.created_at.getTime()
    )
    public readonly comments!: safe.Has.OneToMany<BbsComment>;
}