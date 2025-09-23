import Link from 'next/link'
import React from 'react'

export default function FooterRegister({ styles }) {
    return (
        <div className={styles.footer}>
            <p >Already have an account? <Link href="/login" className={styles.link}>Login now</Link></p>
        </div>
    )
}
