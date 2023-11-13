/**
 * @packageDocumentation
 * @module api.typings
 */
//================================================================
/**
 * 객체 정의로부터 원자 멤버들만의 타입을 추려냄.
 *
 * @template Instance 대상 객체의 타입
 * @author Samchon
 */
export type Atomic<Instance extends object> = {
  [P in keyof Instance]: Instance[P] extends object ? never : Instance[P];
};
