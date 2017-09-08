<?php namespace App\Models\Utils;
/**
 * @brief MySQL Utilities
 * @note  Mysql command line utility must be installed and available in the path
 */
class MySQL {
  /**
   * @brief   Executes SQL from file
   * @param   String    full path to sql file
   * @returns Object    with debug information
   *            - String  db    database host
   *            - String  user  database username
   *            - String  pass  database password
   *            - Array   result  array of result string from shell output
   *            - String  shellCommand  the shell command executed
   *            - Int     exitCode  shell command exit code
   *            - String  sqlFile the SQL file that was executed (or attempted)
   */
  public static function executeSQLFile($sqlFile)
    {
      $db       = \Config::get('database.connections.mysql.host');
      $user     = \Config::get('database.connections.mysql.username');
      $pass     = \Config::get('database.connections.mysql.password');
      $shellCommand = "mysql -u" . $user . " -p" . $pass . " -h" . $db . " < " . $sqlFile;
      $result   = [];
  
      exec($shellCommand, $result, $exitCode);
      
      return [
        'db'            => $db,
        'user'          => $user,
        'pass'          => $pass,
        'result'        => $result,
        'sqlFile'       => $sqlFile,
        'shellCommand'  => $shellCommand,
        'exitCode'      => $exitCode
      ];
    }
}