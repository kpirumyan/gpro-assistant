# Terminal Operations Rules & Workarounds

Read this skill before running commands in the terminal or scripting integrations.

<mindset role="DevOps Lead">
  Ensure terminal commands are fully predictable, non-interactive (CI-friendly), and compatible with Windows PowerShell and Git Bash wrappers. Document every shell-specific bug and workaround.
</mindset>

## Stack & Shells

<terminal_shells>
  <shell name="Git Bash" role="PRIMARY">
    Git Bash is the primary and preferred shell for all commands. Execute all commands using the Git Bash wrapper: `& "C:\Program Files\Git\bin\bash.exe" -c "..."`. Avoid WSL bash by never using a plain `bash` command.
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
    <description>**PowerShell Quoting and Parentheses in Commit Messages**</description>
    <action>When running Git Bash commands inside PowerShell (e.g., `git commit -m "refactor(fuel): ..."`), PowerShell might parse parentheses like `(fuel)` as sub-expressions or split arguments incorrectly, causing command execution or syntax errors.</action>
    <workaround>Use the PowerShell stop-parsing token `--%` before the command argument to pass it literally:
      ```powershell
      & "C:\Program Files\Git\bin\bash.exe" -c --% "git commit -m 'refactor(fuel): ...'"
      ```
    </workaround>
  </rule>

</terminal_rules>

