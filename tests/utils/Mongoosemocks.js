/**
 * Creates a mock object that behaves like a mongoose Query: chainable
 * .populate()/.sort()/.select()/.lean() calls, and can also be `await`ed
 * directly (since it's thenable) — matching how the real controller code
 * sometimes chains .lean() and sometimes just awaits the query directly.
 */
export const makeQuery = (resolvedValue) => {
  const query = {
    populate: vi.fn(() => query),
    sort: vi.fn(() => query),
    select: vi.fn(() => query),
    lean: vi.fn(() => Promise.resolve(resolvedValue)),
    then: (resolve, reject) => Promise.resolve(resolvedValue).then(resolve, reject),
    catch: (reject) => Promise.resolve(resolvedValue).catch(reject),
  };
  return query;
};

/** Minimal fake Express res: tracks status code + json body, chainable like real res. */
export const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockImplementation((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn().mockImplementation((body) => {
    res.body = body;
    return res;
  });
  return res;
};