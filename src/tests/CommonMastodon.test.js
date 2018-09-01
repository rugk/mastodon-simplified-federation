import "https://unpkg.com/mocha@5.2.0/mocha.js"; /* globals mocha */
import "https://unpkg.com/chai@4.1.2/chai.js"; /* globals chai */
import "https://unpkg.com/sinon@6.1.5/pkg/sinon.js"; /* globals sinon */

import * as Mastodon from "/common/modules/Mastodon.js";

describe("common module: Mastodon", function () {
    describe("splitUserHandle()", function () {
        it('correctly splits "usual" valid handles', function () {
            chai.assert.deepEqual(Mastodon.splitUserHandle("rugk_testing@mastodon.social"), {
                username: "rugk_testing",
                server: "mastodon.social"
            }, 'does not handle correctly: "rugk_testing@mastodon.social"');
            chai.assert.deepEqual(Mastodon.splitUserHandle("rugk@social.wiuwiu.de"), {
                username: "rugk",
                server: "social.wiuwiu.de"
            }, 'does not handle correctly: "rugk@social.wiuwiu.de"');
            chai.assert.deepEqual(Mastodon.splitUserHandle("FakeUser123Name@fake.example"), {
                username: "FakeUser123Name",
                server: "fake.example"
            }, 'does not handle correctly: "FakeUser123Name@fake.example"');
        });

        it("correctly splits handles with @-prefix", function () {
            chai.assert.deepEqual(Mastodon.splitUserHandle("@rugk_testing@mastodon.social"), {
                username: "rugk_testing",
                server: "mastodon.social"
            }, 'does not handle correctly: "@rugk_testing@mastodon.social"');
            chai.assert.deepEqual(Mastodon.splitUserHandle("@rugk@social.wiuwiu.de"), {
                username: "rugk",
                server: "social.wiuwiu.de"
            }, 'does not handle correctly: "@rugk@social.wiuwiu.de"');
            chai.assert.deepEqual(Mastodon.splitUserHandle("@FakeUser123Name@fake.example"), {
                username: "FakeUser123Name",
                server: "fake.example"
            }, 'does not handle correctly: "FakeUser123Name@fake.example"');
        });

        it("correctly splits handles with Emoji", function () {
            chai.assert.deepEqual(Mastodon.splitUserHandle("thinking🤔user@whatis🤔.great.app"), {
                username: "thinking🤔user",
                server: "whatis🤔.great.app"
            }, 'does not handle correctly: "thinking🤔user@whatis🤔.great.app"');
            chai.assert.deepEqual(Mastodon.splitUserHandle("@thinking🤔user@whatis🤔.great.app"), {
                username: "thinking🤔user",
                server: "whatis🤔.great.app"
            }, 'does not handle correctly: "@thinking🤔user@whatis🤔.great.app"');
        });

        it("correctly rejects incorrect handles", function () {
            chai.assert.throws(
                Mastodon.splitUserHandle.bind(null, "rugk_testingmastodon.social"),
                TypeError,
                "invalid Mastodon handle",
                'does not handle correctly: "rugk_testingmastodon.social"'
            );
            chai.assert.throws(
                Mastodon.splitUserHandle.bind(null, "@rugk_testingmastodon.social"),
                TypeError,
                "invalid Mastodon handle",
                'does not handle correctly: "@rugk_testingmastodon.social"'
            );
            chai.assert.throws(
                Mastodon.splitUserHandle.bind(null, "rugk_testing@"),
                TypeError,
                "invalid Mastodon handle",
                'does not handle correctly: "rugk_testing@"'
            );
        });
    });

    describe("getSubscribeApiUrl()", function () {
        beforeEach(function() {
            // TODO: mock settings API to prevent savings
        });
        afterEach(function() {
            sinon.restore();
        });

        it("correctly queries webfinger", async function () {
            const URI_STRING = "UNIQUE_URI_STRING@321478";
            const windowMock = sinon.mock(window);

            windowMock.expects("fetch")
                .once()
                .withArgs(new URL("https://mastodon.social/.well-known/webfinger?resource=acct:rugk_testing@mastodon.social"))
                .resolves(new Response(JSON.stringify({
                    links: [
                        {
                            rel: "http://ostatus.org/schema/1.0/subscribe",
                            template: "https://mastodon.social/authorize_interaction?uri={uri}"
                        }
                    ]
                })));

            await Mastodon.getSubscribeApiUrl({
                username: "rugk_testing",
                server: "mastodon.social"
            }, URI_STRING, true);

            windowMock.verify();
        });

        it("correctly returns OStatus subscribe URL with authorize_interaction", async function () {
            const URI_STRING = "UNIQUE_URI_STRING@876876";
            sinon.stub(window, "fetch").resolves(new Response(JSON.stringify({
                links: [
                    {
                        rel: "http://ostatus.org/schema/1.0/subscribe",
                        template: "https://mastodon.social/authorize_interaction?uri={uri}"
                    }
                ]
            })));

            const returnedUrl = await Mastodon.getSubscribeApiUrl({
                username: "rugk_testing",
                server: "mastodon.social"
            }, URI_STRING, true);

            chai.assert.strictEqual(returnedUrl, `https://mastodon.social/authorize_interaction?uri=${URI_STRING}`);
        });

        it("correctly returns OStatus subscribe URL with authorize_follow", async function () {
            const URI_STRING = "UNIQUE_URI_STRING@876876";
            sinon.stub(window, "fetch").resolves(new Response(JSON.stringify({
                links: [
                    {
                        rel: "http://ostatus.org/schema/1.0/subscribe",
                        template: "https://mastodon.social/authorize_follow?acct={uri}"
                    }
                ]
            })));

            const returnedUrl = await Mastodon.getSubscribeApiUrl({
                username: "rugk_testing",
                server: "mastodon.social"
            }, URI_STRING, true);

            chai.assert.strictEqual(returnedUrl, `https://mastodon.social/authorize_follow?acct=${URI_STRING}`);
        });
    });
});
