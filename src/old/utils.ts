export const eps = 1e-6; // 精度

export function feq(a: number, b: number): boolean {
    return Math.abs(a - b) < eps;
}