/*
 *  Copyright (c) 2005-2014, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */
asset.manager = function(ctx){
    return {
    get:function(id){
       log.info('Calling custom get of asset');
       return this._super.get.call(this,id);
    },
        /*search : function(query, paging) {
            var carbonAPI = require('carbon');
            var tenantDomain = carbonAPI.server.tenantDomain({
                tenantId : ctx.tenantId
            });
            var server = require('store').server;
            var user = server.current(ctx.session);
            var userName = '__wso2.am.anon__';

            if (user != null) {
                userName = user.username;
            }
            log.info('============== user name ==========' + userName);
            var apistore = require('apistore').apistore.instance(userName);
            var assetApi = apistore.getAllPaginatedAPIsByStatus(tenantDomain,
                    0, 100, '');
            log.info('This is the custom APIM search method');
            log.info('============== api json  ==========' + assetApi);
            // return assetApi;

            var json = JSON.parse(assetApi);

            var apisArray = [];
            if (json.apis.length > 0) {
                apisArray = json.apis;
            }
            log.info('============== array ===========' + apisArray);
            return apisArray;
        }*/
    };
};

asset.configure = function(ctx) {
    return {
        meta: {
            search: {
                searchableFields: ['overview_provider', 'overview_name']
            }
        }
    }
};
asset.server = function(ctx) {
    return {
         onUserLoggedIn : function(){            
            var userName=ctx.username;
            var apistore = require('apistore').apistore.instance(userName);
            var subscriber=apistore.getSubscriber(userName);                      
            if(!subscriber){
            apistore.addSubscriber(userName,ctx.tenantId);    
            }
        },
        endpoints: {
            pages: [{
                title: 'Prototyped APIs',
                url: 'prototyped_apis',
                path: 'prototyped_apis.jag'
            }, {
                title: 'My Applications',
                url: 'my_applications',
                path: 'my_applications.jag'
            },/** {
            title: 'API Details'
            url: 'details'
            path: 'details.jag'
            },*/ 
            {
                title: 'My Subscriptions',
                url: 'my_subscriptions',
                path: 'my_subscriptions.jag'
            }, {
                title: 'Forum',
                url: 'forum',
                path: 'forum.jag'
            }, {
                title: 'Statistics',
                url: 'statistics',
                path: 'statistics.jag'
            }]
        }
    };
};
asset.renderer = function(ctx) {
    var twitterLink = function(assetUrl, asset) {
        var attr = asset.attributes || {};
        var description = attr.overview_description ? attr.overview_description : 'No description';
        return 'https://twitter.com/share?text=' + description + '&url=' + assetUrl;
    };
    var facebookLink = function(assetUrl, asset) {
        return 'https://facebook.com/sharer.php?u=' + assetUrl;
    };
    var gplusLink = function(assetUrl, asset) {
        return 'https://plus.google.com/share?url=' + assetUrl;
    };
    var diggitLink = function(assetUrl, asset) {
        return 'https://digg.com/submit?url=' + assetUrl;
    };
    return {
        details:function(page){
            log.info('Details page rendered!!!');
        
    //=================== Getting subscription details ========================

    var carbonAPI = require('carbon');
    var tenantDomain = carbonAPI.server.tenantDomain({
        tenantId : ctx.tenantId
    });
    var server = require('store').server;
    var user = server.current(ctx.session);
    var userName = '__wso2.am.anon__';

    if (user != null) {
        userName = user.username;
    }    
    var lenI,lenJ,i,j,result,apidata,deniedTiers,tiers,appsList=[],subscribedToDefault=false,showSubscribe=false,status;
    var apistore = require('apistore').apistore.instance(userName);
    var applications = JSON.parse(apistore.getApplications(userName));
    var asset = page.assets;
    var resultapi=apistore.getAPI(asset.attributes.overview_provider,asset.name,asset.attributes.overview_version);
    var apidata=JSON.parse(resultapi);    
    if(apidata!=null){
    tiers=apidata.tiers; 
    status=apidata.status;
    if(status=="PUBLISHED"){
    showSubscribe=true;
    }   
    }    
    var subscriptions=JSON.parse(apistore.getAPISubscriptions(asset.attributes.overview_provider,asset.name,asset.attributes.overview_version,userName));    
    if(applications!=null){
                lenI = applications.length;
            }if(subscriptions!=null){
                lenJ = subscriptions.length;
            }
            Label1:
                    for (i = 0; i < lenI; i++) {
                        var application = applications[i];
                        for (j = 0; j < lenJ; j++) {
                            var subscription = subscriptions[j];
                            if (subscription.applicationId == application.id) {
                                continue Label1;
                            }
                        }
                        if(application.name=="DefaultApplication"){
                                   subscribedToDefault=true;
                        }
                        if(application.status=="APPROVED"){
                        appsList.push(application);
                        }
                    }
            result = apistore.getDeniedTiers();
            deniedTiers = result.tiers;
            var k,m,allowedTiers,denied = false, tiersAvailable = false;

                    for(var m=0;m<tiers.length;m++){
                       for (var k=0;k<deniedTiers.length;k++) {
                       if (tiers[m].tierName == deniedTiers[k].tierName) {
                            denied = true;
                       }
                       }
                       if (!denied) {
                       allowedTiers+=tiers[m];
                       tiersAvailable = true;                      
                    }
                    denied = false;
                    }
            
       
    page.applications= appsList;
    page.tiersAvailable=tiersAvailable;
    page.tiers=allowedTiers;
    page.subscribedToDefault=subscribedToDefault;
    page.showSubscribe=showSubscribe;
    page.api=apidata;
    

    //=================== Getting subscription details ========================
        },
        pageDecorators: {
            socialSitePopulator: function(page, meta) {
                var utils = require('utils');
                //If the 
                if (!utils.reflection.isArray(page.assets || [])) {
                    var asset = page.assets;
                    var assetUrl = this.buildAssetPageUrl('api', '/details/' + asset.id);
                    page.social_sites = {};
                    var facebook = page.social_sites.facebook = {};
                    var gplus = page.social_sites.gplus = {};
                    var twitter = page.social_sites.twitter = {};
                    var diggit = page.social_sites.diggit = {};
                    facebook.href = facebookLink(assetUrl, asset);
                    gplus.href = gplusLink(assetUrl, asset);
                    twitter.href = twitterLink(assetUrl, asset);
                    diggit.href = diggitLink(assetUrl, asset);
                }
            },
            embedLinkPopulator: function(page, meta) {
                var utils = require('utils');
                if (!utils.reflection.isArray(page.assets || [])) {
                    var asset = page.assets;
                    var attributes = asset.attributes || {};
                    var widgetLink = '/apis/widget';
                    var assetUrl = widgetLink+'?name=' + asset.name + '&version=' + attributes.overview_version + '&provider=' + attributes.overview_provider;
                    page.api_embed_links = '<iframe width="450" height="120" src="' + assetUrl + '" frameborder="0" allowfullscreen></iframe>';
                }
            }
        }
    };
}