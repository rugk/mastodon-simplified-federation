import "https://unpkg.com/mocha@5.2.0/mocha.js"; /* globals mocha */
import "https://unpkg.com/chai@4.1.2/chai.js"; /* globals chai */
import "https://unpkg.com/sinon@6.1.5/pkg/sinon.js"; /* globals sinon */

import * as MastodonApi from "/common/modules/MastodonApi.js";

describe("common module: MastodonApi", function () {
    describe("getSubscribeApiUrl()", function () {
        afterEach(function() {
            sinon.restore();
        });

        it("correctly queries Mastodon API", async function () {
            const fakeResult = {
                id: 8923749723,
                url: "https://mastodon.social/whatever/URL",
                array: [
                    {
                        one: "http://ostatus.org/",
                        two: "https://mastodon.social/",
                        three: 5756
                    }
                ],
                subobject: {
                    okayDeep: 6768,
                    string: "hjkhkjhj"
                }
            }
            const windowMock = sinon.mock(window);

            windowMock.expects("fetch")
                .once()
                .withArgs(new URL("https://mastodon.social/api/v1/statuses/743432936282"))
                .resolves(new Response(JSON.stringify(fakeResult)));

            await MastodonApi.getTootStatus("mastodon.social", 743432936282);

            windowMock.verify();
        });

        it("correctly returns JSON data", async function () {
            const fakeResult = {
                id: 8923749723,
                url: "https://mastodon.social/whatever/URL",
                array: [
                    {
                        one: "http://ostatus.org/",
                        two: "https://mastodon.social/",
                        three: 5756
                    }
                ],
                subobject: {
                    okayDeep: 6768,
                    string: "hjkhkjhj"
                }
            }
            const windowMock = sinon.mock(window);

            windowMock.expects("fetch")
                .once()
                .withArgs(new URL("https://mastodon.social/api/v1/statuses/743432936282"))
                .resolves(new Response(JSON.stringify(fakeResult)));

            const returnData = await MastodonApi.getTootStatus("mastodon.social", 743432936282);

            chai.assert.deepEqual(returnData, fakeResult);

            windowMock.verify();
        });
    });
});
