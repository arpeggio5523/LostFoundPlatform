/**
 * Creates a mock object that behaves like a mongoose Query: chainable
 * .populate()/.sort()/.select()/.lean() calls, and can also be `await`ed
 * directly (since it's thenable) — matching how the real controller code
 * sometimes chains .lean() and sometimes just awaits the query directly.
 */
export const makeQuery = (resolvedValue) => {
  const query = {
    populate: jest.fn(() => query),
    sort: jest.fn(() => query),
    select: jest.fn(() => query),
    lean: jest.fn(() => Promise.resolve(resolvedValue)),
    then: (resolve, reject) => Promise.resolve(resolvedValue).then(resolve, reject),
    catch: (reject) => Promise.resolve(resolvedValue).catch(reject),
  };
  return query;
};

/** Minimal fake Express res: tracks status code + json body, chainable like real res. */
export const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockImplementation((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockImplementation((body) => {
    res.body = body;
    return res;
  });
  return res;
};