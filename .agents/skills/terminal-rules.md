# Terminal Operations Rules & Workarounds

Read this skill before running commands in the terminal or scripting integrations.

<mindset role="DevOps Lead">
  Ensure terminal commands are fully predictable, non-interactive (CI-friendly), and compatible with Windows PowerShell and Git Bash wrappers. Document every shell-specific bug and workaround.
</mindset>

## Stack & Shells

<terminal_shells>
  <shell name="PowerShell" role="PRIMARY">
    PowerShell is the primary and preferred shell for all commands (Git, npm, Node.js, etc.) because they are natively available in the Windows PATH, execute faster, and avoid complex nested escaping.
  </shell>
  <shell name="Git Bash" role="FALLBACK">
    Use **only** when specifically running a `.sh` shell script or unix-only command utilities. Do not use for standard `npm`, `git`, or `node` commands to prevent unnecessary nesting and quoting issues.
  </shell>
</terminal_shells>

---

## Rules & Workarounds

<terminal_rules>
  <rule id="non_tty_drizzle_generate" severity="CRITICAL">
    <description>**Non-TTY environments (Drizzle Kit Generate)**</description>
    <action>When running inside automated agent sandboxes, `process.stdout.isTTY` is `false`. Since `drizzle-kit generate` requires interactive prompts to confirm renames or drop/create conflicts, it crashes with `Error: Interactive prompts require a TTY terminal`.</action>
    <workaround>Use the `--custom` flag to bypass the prompt:
      ```bash
      npm run db:generate -- --custom
      ```
      This creates an empty SQL file but successfully updates Drizzle Kit snapshots/journals.
      Manually fill the generated `.sql` migration file with the necessary `ALTER TABLE RENAME` SQL statements, then run `npm run db:migrate`.
    </workaround>
  </rule>

  <rule id="powershell_quoting_parentheses" severity="MANDATORY">
    <description>**Parentheses and Quoting in PowerShell**</description>
    <action>When passing commands containing parentheses (e.g. `refactor(db)`) inside double quotes to Git Bash from PowerShell, PowerShell tries to evaluate or parse it, throwing `CommandNotFoundException`.</action>
    <workaround>
      1. For Git operations (which don't require Node.js paths/variables), run the command directly in PowerShell without the Git Bash wrapper:
         ```powershell
         git commit -m "refactor(db): description"
         ```
      2. If Git Bash is strictly required, ensure proper escaping or variable assignment to prevent PowerShell parsing:
         ```powershell
         $msg = 'refactor(db): description'
         & "C:\Program Files\Git\bin\bash.exe" -c "git commit -m '$msg'"
         ```
    </workaround>
  </rule>

  <rule id="powershell_npx_execution_policy" severity="MANDATORY">
    <description>**PowerShell Execution Policy Blocking npx/npm Wrapper Scripts**</description>
    <action>On Windows, calling `npx` or `npm` inside PowerShell may attempt to load `npx.ps1` or `npm.ps1`. If script execution is restricted on the system, this fails with a `SecurityError (UnauthorizedAccess / PSSecurityException)`.</action>
    <workaround>Use `npx.cmd` or `npm.cmd` explicitly instead of `npx` or `npm` when running node tools from PowerShell to bypass the script execution policy restrictions.</workaround>
  </rule>
</terminal_rules>

