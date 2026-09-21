export interface Circle {
	id: string;
	name: string;
	initial: string;
}

export type CircleMemberColor = "blue" | "yellow";

export interface CircleMember {
	id: string;
	name: string;
	color: CircleMemberColor;
}
