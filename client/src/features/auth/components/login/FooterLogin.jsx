import Link from 'next/link'
import React from 'react'

export default function FooterLogin({ styles }) {
    return (
        <div className={styles.footer}>
            <p >Don't have an account? <Link href="/register" className={styles.link}>Sign up now</Link></p>
            <p>@2025 maps, All rights reserved</p>
        </div>
    )
}
