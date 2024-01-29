type Result<T, E> = { ok: true; value: T } | { ok: false; value: E };

function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function Err<E>(value: E): Result<never, E> {
  return { ok: false, value };
}

export async function wrapReject<T>(
  promise: Promise<T>,
): Promise<Result<T, unknown>> {
  try {
    const value = await promise;
    return Ok(value);
  } catch (e) {
    return Err(e);
  }
}

export function wrapError<T>(f: () => T): Result<T, unknown> {
  try {
    const value = f();
    return Ok(value);
  } catch (e) {
    return Err(e);
  }
}
