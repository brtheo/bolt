@isTest
public with sharing class Bolt_Test {
  @isTest()
  public static void testDynamicSOQL() {
    Test.startTest();
    Bolt.soqlQuery('SELECT Id FROM Case LIMIT 1', '{}', 'WITH USER_MODE');
    Test.stopTest();
  }
}