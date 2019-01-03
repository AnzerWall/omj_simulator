export const eps: number = 1e-6;
export function feq(a, b): boolean {
    return Math.abs(a - b) < eps;
}

export const oo: number = 1e8;
