public with sharing class Bolt {
    @AuraEnabled(cacheable=true)
    public static Object[] soqlQuery(string query, String params, string mode) {
    AccessLevel level = mode == 'WITH USER_MODE' ? AccessLevel.USER_MODE : AccessLevel.SYSTEM_MODE;
    Map<String,Object> bindParams = (Map<String,Object>) JSON.deserializeUntyped(params);
    return Database.queryWithBinds(
      query,
      bindParams,
      level
    );
  }
}